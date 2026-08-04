import nodemailer from "nodemailer";

const EMAIL_TYPES = {
  REGISTER: {
    subject: "[회원가입] Donakawa 이메일 인증 코드",
    title: "Donakawa 회원가입 이메일 인증",
    description: "아래 인증 코드를 입력해 회원가입을 완료해주세요.",
  },
  RESET_PASSWORD: {
    subject: "[비밀번호 재설정] Donakawa 이메일 인증 코드",
    title: "Donakawa 비밀번호 재설정 인증",
    description: "아래 인증 코드를 입력해 비밀번호 재설정을 진행해주세요.",
  },
};

const DEFAULT_CODE_TTL_MINUTES = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let cachedTransporter;

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
    throw new Error(`${name} is required`);
  }

  return value;
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const port = Number(getRequiredEnv("SMTP_PORT"));
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("SMTP_PORT is invalid");
  }

  cachedTransporter = nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASSWORD"),
    },
  });

  return cachedTransporter;
}

function validateInput(input) {
  const to = typeof input.to === "string" ? input.to.trim() : "";
  const code = typeof input.code === "string" ? input.code.trim() : "";
  const type = typeof input.type === "string" ? input.type.trim() : "";

  if (!EMAIL_PATTERN.test(to)) {
    return { error: jsonResponse(400, { message: "to is invalid" }) };
  }

  if (!/^\d{6}$/.test(code)) {
    return { error: jsonResponse(400, { message: "code must be 6 digits" }) };
  }

  if (!EMAIL_TYPES[type]) {
    return { error: jsonResponse(400, { message: "type is invalid" }) };
  }

  return { to, code, type };
}

function buildHtml({ code, template, ttlMinutes }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #7A5751;">${template.title}</h2>
      <p>안녕하세요, Donakawa입니다.</p>
      <p>${template.description}</p>
      <div style="
        font-size: 24px;
        font-weight: bold;
        margin: 20px 0;
        padding: 10px;
        background-color: #f0f0f0;
        display: inline-block;
        border-radius: 5px;
      ">
        ${code}
      </div>
      <p>인증 코드는 <strong>${ttlMinutes}분</strong> 동안 유효합니다.</p>
      <p style="color: #999; font-size: 12px;">본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다.</p>
    </div>
  `;
}

export const handler = async (event) => {
  const input = parseEvent(event);
  const validated = validateInput(input);
  if (validated.error) return validated.error;

  const { to, code, type } = validated;
  const template = EMAIL_TYPES[type];
  const ttlMinutes = Number(
    input.ttlMinutes ?? process.env.EMAIL_CODE_TTL_MINUTES ?? DEFAULT_CODE_TTL_MINUTES,
  );

  try {
    const smtpUser = getRequiredEnv("SMTP_USER");
    const result = await getTransporter().sendMail({
      from: process.env.MAIL_FROM || `"Donakawa" <${smtpUser}>`,
      to,
      subject: template.subject,
      html: buildHtml({
        code,
        template,
        ttlMinutes: Number.isFinite(ttlMinutes) && ttlMinutes > 0
          ? Math.floor(ttlMinutes)
          : DEFAULT_CODE_TTL_MINUTES,
      }),
    });

    return jsonResponse(200, {
      message: "email sent",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { message: "email send failed" });
  }
};
