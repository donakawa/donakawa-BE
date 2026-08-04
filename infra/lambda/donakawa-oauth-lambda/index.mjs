const FORM_CONTENT_TYPE = "application/x-www-form-urlencoded";
const DEFAULT_UPSTREAM_TIMEOUT_MS = 5000;

class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}

function parseEvent(event) {
  if (typeof event?.body === "string") {
    try {
      return JSON.parse(event.body);
    } catch {
      return {};
    }
  }

  return event ?? {};
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
    },
    isBase64Encoded: false,
    body: JSON.stringify(payload),
  };
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new ConfigError(`${name} is required`);
  }

  return value;
}

function getSafeErrorDetail(error) {
  return {
    name: error?.name,
    message: error?.message,
    upstreamStatus: error?.status,
    upstreamError: error?.data?.error,
    upstreamErrorDescription: error?.data?.error_description,
  };
}

async function fetchJson(url, options) {
  const abortController = new AbortController();
  const timeoutMs = Number(
    process.env.OAUTH_UPSTREAM_TIMEOUT_MS ?? DEFAULT_UPSTREAM_TIMEOUT_MS,
  );
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: abortController.signal,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const error = new Error(`upstream returned ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function getGoogleUserInfo(code) {
  let tokens;
  try {
    const tokenParams = new URLSearchParams({
      code,
      client_id: getRequiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: getRequiredEnv("GOOGLE_CALLBACK_URL"),
      grant_type: "authorization_code",
    });

    tokens = await fetchJson("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "content-type": FORM_CONTENT_TYPE,
      },
      body: tokenParams,
    });
  } catch (error) {
    console.error("Google Token Error:", error);
    if (error instanceof ConfigError) {
      return jsonResponse(500, {
        errorCode: "OAUTH_CONFIG_ERROR",
        message: "OAuth Lambda 환경변수가 누락되었습니다.",
        detail: getSafeErrorDetail(error),
      });
    }

    return jsonResponse(401, {
      errorCode: "G002",
      message: "Google 인증에 실패했습니다.",
      detail: getSafeErrorDetail(error),
    });
  }

  if (!tokens.access_token) {
    return jsonResponse(401, {
      errorCode: "G002",
      message: "Google 인증에 실패했습니다.",
      detail: { message: "Google access token is missing" },
    });
  }

  let data;
  try {
    data = await fetchJson("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        authorization: `Bearer ${tokens.access_token}`,
      },
    });
  } catch (error) {
    console.error("Google UserInfo Error:", error);
    return jsonResponse(401, {
      errorCode: "G001",
      message: "Google 사용자 정보를 가져올 수 없습니다.",
      detail: getSafeErrorDetail(error),
    });
  }

  if (!data.email || !data.id) {
    return jsonResponse(401, {
      errorCode: "G001",
      message: "Google 사용자 정보를 가져올 수 없습니다.",
      detail: { message: "Google user info response is incomplete" },
    });
  }

  return jsonResponse(200, {
    email: data.email,
    googleUid: data.id,
    nickname: data.name || data.email.split("@")[0],
  });
}

async function getKakaoAccessToken(code) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: getRequiredEnv("KAKAO_CLIENT_ID"),
    redirect_uri: getRequiredEnv("KAKAO_REDIRECT_URI"),
    code,
  });

  if (process.env.KAKAO_CLIENT_SECRET) {
    params.append("client_secret", process.env.KAKAO_CLIENT_SECRET);
  }

  const data = await fetchJson("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: {
      "content-type": FORM_CONTENT_TYPE,
    },
    body: params,
  });

  if (!data.access_token) {
    throw new Error("Kakao access token is missing");
  }

  return data.access_token;
}

async function getKakaoUserInfo(code) {
  let accessToken;
  try {
    accessToken = await getKakaoAccessToken(code);
  } catch (error) {
    console.error("Kakao Token Error:", error);
    if (error instanceof ConfigError) {
      return jsonResponse(500, {
        errorCode: "OAUTH_CONFIG_ERROR",
        message: "OAuth Lambda 환경변수가 누락되었습니다.",
        detail: getSafeErrorDetail(error),
      });
    }

    return jsonResponse(401, {
      errorCode: "K001",
      message: "카카오 토큰 발급에 실패했습니다.",
      detail: getSafeErrorDetail(error),
    });
  }

  const data = await fetchJson("https://kapi.kakao.com/v2/user/me", {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  const { id, kakao_account } = data;
  if (!kakao_account?.email || !id) {
    return jsonResponse(401, {
      errorCode: "K002",
      message: "카카오 사용자 정보를 가져올 수 없습니다.",
    });
  }

  if (!kakao_account.is_email_valid || !kakao_account.is_email_verified) {
    return jsonResponse(401, {
      errorCode: "K004",
      message: "인증되지 않은 이메일입니다. 카카오 계정에서 이메일 인증을 완료해주세요.",
    });
  }

  return jsonResponse(200, {
    email: kakao_account.email,
    kakaoUid: id.toString(),
    nickname: kakao_account.profile?.nickname || kakao_account.email.split("@")[0],
  });
}

async function unlinkKakaoUser(kakaoUid) {
  const adminKey = process.env.KAKAO_ADMIN_KEY;
  if (!adminKey) {
    return jsonResponse(200, { skipped: true });
  }

  await fetchJson("https://kapi.kakao.com/v1/user/unlink", {
    method: "POST",
    headers: {
      "content-type": FORM_CONTENT_TYPE,
      authorization: `KakaoAK ${adminKey}`,
    },
    body: new URLSearchParams({
      target_id_type: "user_id",
      target_id: kakaoUid,
    }),
  });

  return jsonResponse(200, { unlinked: true });
}

export const handler = async (event) => {
  const input = parseEvent(event);
  const { provider, action } = input;

  try {
    if (provider === "GOOGLE" && action === "GET_USER_INFO") {
      if (typeof input.code !== "string" || !input.code) {
        return jsonResponse(400, { errorCode: "G002", message: "code is required" });
      }
      return await getGoogleUserInfo(input.code);
    }

    if (provider === "KAKAO" && action === "GET_USER_INFO") {
      if (typeof input.code !== "string" || !input.code) {
        return jsonResponse(400, { errorCode: "K003", message: "code is required" });
      }
      return await getKakaoUserInfo(input.code);
    }

    if (provider === "KAKAO" && action === "UNLINK_USER") {
      if (typeof input.kakaoUid !== "string" || !input.kakaoUid) {
        return jsonResponse(400, {
          errorCode: "K005",
          message: "kakaoUid is required",
        });
      }
      return await unlinkKakaoUser(input.kakaoUid);
    }

    return jsonResponse(400, {
      errorCode: "O001",
      message: "unsupported oauth action",
    });
  } catch (error) {
    console.error("OAuth Lambda Error:", error);
    if (error?.name === "AbortError") {
      return jsonResponse(504, {
        errorCode: "OAUTH_UPSTREAM_TIMEOUT",
        message: "OAuth 외부 API 요청 시간이 초과되었습니다.",
      });
    }

    return jsonResponse(500, {
      errorCode: provider === "GOOGLE" ? "G002" : "K003",
      message: provider === "GOOGLE"
        ? "Google 인증에 실패했습니다."
        : "카카오 인증에 실패했습니다.",
      detail: getSafeErrorDetail(error),
    });
  }
};
