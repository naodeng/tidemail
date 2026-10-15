import assert from "node:assert/strict";
import test from "node:test";
import { parseInboundEmail } from "./email.ts";

const rawEmail = [
  "From: Alice Example <alice@example.com>",
  "To: inbox@sample.net",
  "Subject: Welcome",
  "Message-ID: <message-1@example.com>",
  "Date: Thu, 15 Oct 2026 09:00:00 +0000",
  "Content-Type: text/plain; charset=utf-8",
  "",
  "Your verification code is 123456.",
].join("\r\n");

test("inbound mail is parsed into a storable email record", async () => {
  const createdAt = new Date("2026-10-15T09:05:00.000Z");
  const email = await parseInboundEmail(
    {
      raw: new Response(rawEmail).body!,
      from: "alice@example.com",
      to: "inbox@sample.net",
    },
    "email-1",
    createdAt,
  );

  assert.equal(email.id, "email-1");
  assert.equal(email.messageFrom, "alice@example.com");
  assert.equal(email.messageTo, "inbox@sample.net");
  assert.equal(email.from.address, "alice@example.com");
  assert.equal(email.from.name, "Alice Example");
  assert.equal(email.subject, "Welcome");
  assert.equal(email.messageId, "<message-1@example.com>");
  assert.equal(email.text, "Your verification code is 123456.\n");
  assert.equal(email.createdAt.toISOString(), createdAt.toISOString());
  assert.equal(email.updatedAt.toISOString(), createdAt.toISOString());
});

test("inbound mail without required headers is rejected before storage", async () => {
  const raw = "Subject: Missing sender and message ID\r\n\r\nBody";

  await assert.rejects(
    parseInboundEmail(
      {
        raw: new Response(raw).body!,
        from: "unknown@example.com",
        to: "inbox@sample.net",
      },
      "invalid-email",
      new Date("2026-10-15T09:05:00.000Z"),
    ),
  );
});
