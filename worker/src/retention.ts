export const EMAIL_RETENTION_DAYS = 7;
const SEND_RATE_LIMIT_RETENTION_SECONDS = 24 * 60 * 60;

export function getEmailExpirationCutoff(now = Date.now()): Date {
  return new Date(now - EMAIL_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

export function getSendRateLimitExpirationCutoff(now = Date.now()): number {
  return Math.floor(now / 1000) - SEND_RATE_LIMIT_RETENTION_SECONDS;
}
