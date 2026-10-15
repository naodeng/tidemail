import assert from "node:assert/strict";
import test from "node:test";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { emails, sendRateLimits } from "./schema.ts";

test("mail tables define inbox lookup and send-rate indexes", () => {
  const emailConfig = getTableConfig(emails);
  const sendRateLimitConfig = getTableConfig(sendRateLimits);

  assert.equal(
    emailConfig.indexes[0].config.name,
    "idx_emails_message_to_created_at",
  );
  assert.deepEqual(
    emailConfig.indexes[0].config.columns.map((column) => column.name),
    ["message_to", "created_at"],
  );
  assert.equal(sendRateLimitConfig.primaryKeys.length, 1);
  assert.deepEqual(
    sendRateLimitConfig.primaryKeys[0].columns.map((column) => column.name),
    ["identifier", "window_start_epoch_sec"],
  );
  assert.equal(
    sendRateLimitConfig.indexes[0].config.name,
    "idx_send_rate_limits_window",
  );
});
