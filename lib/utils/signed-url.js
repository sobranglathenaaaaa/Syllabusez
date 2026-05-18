import crypto from "node:crypto";

const SIGNED_URL_SECRET = process.env.SIGNED_URL_SECRET || "dev-secret";
const SIGNED_URL_EXPIRY_MS = 1000 * 60 * 10;

function sign(value) {
  return crypto.createHmac("sha256", SIGNED_URL_SECRET).update(value).digest("hex");
}

export function createMaterialSignedUrl(payload) {
  const encodedPayload = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + SIGNED_URL_EXPIRY_MS }),
  ).toString("base64url");
  const signature = sign(encodedPayload);
  return `/api/materials/download?token=${encodedPayload}.${signature}`;
}

export function verifyMaterialSignedUrl(token) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = sign(encodedPayload);
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  if (payload.exp < Date.now()) {
    return null;
  }

  return payload;
}
