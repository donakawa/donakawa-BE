const DEFAULT_TIMEOUT_MS = 5000;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

function normalizeHeaders(headers) {
  const normalized = {};
  for (const [key, value] of headers.entries()) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
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

function errorResponse(statusCode, message) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
    },
    isBase64Encoded: false,
    body: JSON.stringify({ message }),
  };
}

export const handler = async (event) => {
  const input = parseEvent(event);
  const timeoutMs = Number(input.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const maxBytes = Number(input.maxBytes ?? MAX_IMAGE_BYTES);

  if (typeof input.url !== "string" || input.url.trim() === "") {
    return errorResponse(400, "url is required");
  }

  let targetUrl;
  try {
    targetUrl = new URL(input.url);
  } catch {
    return errorResponse(400, "url is invalid");
  }

  if (!ALLOWED_PROTOCOLS.has(targetUrl.protocol)) {
    return errorResponse(400, "url protocol is not allowed");
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const upstream = await fetch(targetUrl, {
      signal: abortController.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; donakawa-external-fetch-lambda/1.0)",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    const contentLength = Number(upstream.headers.get("content-length") ?? 0);
    if (contentLength > maxBytes) {
      return errorResponse(413, "image is too large");
    }

    const arrayBuffer = await upstream.arrayBuffer();
    if (arrayBuffer.byteLength > maxBytes) {
      return errorResponse(413, "image is too large");
    }

    const headers = normalizeHeaders(upstream.headers);
    const contentType = headers["content-type"] ?? "";
    if (contentType && !contentType.toLowerCase().startsWith("image/")) {
      return errorResponse(415, "response is not an image");
    }

    return {
      statusCode: upstream.status,
      headers: {
        "content-type": contentType || "application/octet-stream",
        "content-length": String(arrayBuffer.byteLength),
      },
      isBase64Encoded: true,
      body: Buffer.from(arrayBuffer).toString("base64"),
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return errorResponse(504, "external fetch timed out");
    }

    console.error(error);
    return errorResponse(502, "external fetch failed");
  } finally {
    clearTimeout(timeout);
  }
};
