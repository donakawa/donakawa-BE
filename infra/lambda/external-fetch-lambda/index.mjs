import { lookup } from "node:dns/promises";
import net from "node:net";

const DEFAULT_TIMEOUT_MS = 5000;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const FETCH_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (compatible; donakawa-external-fetch-lambda/1.0)",
  accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
};

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

function isPrivateIpv4(address) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return true;
  }

  const [first, second] = parts;
  return (
    first === 0 ||
    first === 10 ||
    first === 100 && second >= 64 && second <= 127 ||
    first === 127 ||
    first === 169 && second === 254 ||
    first === 172 && second >= 16 && second <= 31 ||
    first === 192 && second === 0 ||
    first === 192 && second === 168 ||
    first === 198 && (second === 18 || second === 19) ||
    first >= 224
  );
}

function isPrivateIpv6(address) {
  const normalized = address.toLowerCase();
  const firstHextet = Number.parseInt(normalized.split(":")[0] || "0", 16);
  if (
    normalized === "::" ||
    normalized === "::1" ||
    firstHextet >= 0xfc00 && firstHextet <= 0xfdff ||
    firstHextet >= 0xfe80 && firstHextet <= 0xfebf ||
    firstHextet >= 0xff00
  ) {
    return true;
  }

  if (normalized.startsWith("::ffff:")) {
    return isPrivateIpv4(normalized.slice(7));
  }

  return false;
}

function isBlockedIp(address) {
  const version = net.isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version === 6) return isPrivateIpv6(address);
  return true;
}

async function validateTargetUrl(targetUrl) {
  if (!ALLOWED_PROTOCOLS.has(targetUrl.protocol)) {
    return errorResponse(400, "url protocol is not allowed");
  }

  const hostname = targetUrl.hostname.replace(/^\[|\]$/g, "");
  const resolvedAddresses = net.isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true }).catch(() => []);
  if (
    resolvedAddresses.length === 0 ||
    resolvedAddresses.some(({ address }) => isBlockedIp(address))
  ) {
    return errorResponse(400, "url is invalid");
  }

  return undefined;
}

async function fetchWithValidatedRedirects(targetUrl, signal) {
  let currentUrl = targetUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const validationError = await validateTargetUrl(currentUrl);
    if (validationError) return validationError;

    const upstream = await fetch(currentUrl, {
      signal,
      redirect: "manual",
      headers: FETCH_HEADERS,
    });

    if (![301, 302, 303, 307, 308].includes(upstream.status)) {
      return upstream;
    }

    const location = upstream.headers.get("location");
    if (!location) {
      return errorResponse(400, "url is invalid");
    }

    try {
      currentUrl = new URL(location, currentUrl);
    } catch {
      return errorResponse(400, "url is invalid");
    }
  }

  return errorResponse(400, "url is invalid");
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

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const upstream = await fetchWithValidatedRedirects(
      targetUrl,
      abortController.signal,
    );
    if (!(upstream instanceof Response)) {
      return upstream;
    }

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
