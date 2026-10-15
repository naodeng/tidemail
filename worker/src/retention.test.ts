import assert from "node:assert/strict";
import test from "node:test";
import {
  EMAIL_RETENTION_DAYS,
  getEmailExpirationCutoff,
  getSendRateLimitExpirationCutoff,
} from "./retention.ts";

test("stored emails expire seven days after receipt", () => {
  const now = Date.parse("2026-10-15T12:00:00.000Z");

  assert.equal(EMAIL_RETENTION_DAYS, 7);
  assert.equal(
    getEmailExpirationCutoff(now).toISOString(),
    "2026-10-08T12:00:00.000Z",
  );
});

test("send rate-limit buckets retain only the last 24 hours", () => {
  const now = Date.parse("2026-10-15T12:00:00.000Z");

  assert.equal(
    getSendRateLimitExpirationCutoff(now),
    Math.floor(now / 1000) - 24 * 60 * 60,
  );
});
