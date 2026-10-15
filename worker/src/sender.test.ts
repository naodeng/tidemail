import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCloudflareMimeMessage,
  buildMailChannelsPayload,
  buildResendPayload,
  appendSenderAttribution,
  createMailboxToken,
  escapeHtml,
  getBearerToken,
  getConfiguredSendChannel,
  getProviderSenderName,
  isAllowedMailboxAddress,
  sendRequestSchema,
  verifyMailboxToken,
  type OutgoingEmail,
} from "./sender.ts";

const configuredEnv = {
  SEND_CHANNEL: "resend",
  SENDER_EMAIL: "sender@example.com",
  RESEND_API_KEY: "test-key",
  MAILBOX_TOKEN_SECRET: "test-secret",
};

const outgoingEmail: OutgoingEmail = {
  senderName: "Alice",
  receiverEmail: "recipient@example.net",
  subject: "Hello",
  content: "Message body",
  type: "text/plain",
  replyTo: "alice@example.com",
};

test("send channel is enabled only when all required configuration exists", () => {
  assert.equal(getConfiguredSendChannel(configuredEnv), "resend");
  assert.equal(
    getConfiguredSendChannel({ ...configuredEnv, RESEND_API_KEY: "" }),
    null,
  );
  assert.equal(
    getConfiguredSendChannel({ ...configuredEnv, SENDER_EMAIL: "" }),
    null,
  );
  assert.equal(
    getConfiguredSendChannel({ ...configuredEnv, MAILBOX_TOKEN_SECRET: "" }),
    null,
  );
  assert.equal(
    getConfiguredSendChannel({
      ...configuredEnv,
      SEND_CHANNEL: "mailchannels",
      MAILCHANNELS_API_KEY: "mail-key",
    }),
    "mailchannels",
  );
  assert.equal(
    getConfiguredSendChannel({
      ...configuredEnv,
      SEND_CHANNEL: "mailchannels",
      MAILCHANNELS_API_KEY: "",
    }),
    null,
  );
  assert.equal(
    getConfiguredSendChannel({ ...configuredEnv, SEND_CHANNEL: "unknown" }),
    null,
  );
  assert.equal(
    getConfiguredSendChannel({
      ...configuredEnv,
      SEND_CHANNEL: "cloudflare",
      SEND_EMAIL: { async send() {} },
    }),
    "cloudflare",
  );
  assert.equal(
    getConfiguredSendChannel({
      ...configuredEnv,
      SEND_CHANNEL: "send_email",
      SEND_EMAIL: { async send() {} },
    }),
    "cloudflare",
  );
  assert.equal(
    getConfiguredSendChannel({
      ...configuredEnv,
      SEND_CHANNEL: "cloudflare",
    }),
    null,
  );
});

test("mailbox tokens verify the signed address and reject tampering or expiry", async () => {
  const now = 1_700_000_000_000;
  const token = await createMailboxToken(
    "Alice@Example.com",
    "secret",
    now,
    60,
  );

  assert.equal(
    await verifyMailboxToken(token, "secret", now + 1_000),
    "alice@example.com",
  );
  assert.equal(
    await verifyMailboxToken(`${token}x`, "secret", now + 1_000),
    null,
  );
  assert.equal(
    await verifyMailboxToken(token, "wrong-secret", now + 1_000),
    null,
  );
  assert.equal(await verifyMailboxToken(token, "secret", now + 61_000), null);
  assert.equal(await verifyMailboxToken(token, "secret"), null);
});

test("mailbox tokens reject malformed structure and signed invalid payloads", async () => {
  const now = 1_700_000_000_000;
  const secret = "test-secret";
  assert.equal(await verifyMailboxToken("malformed", secret, now), null);
  assert.equal(await verifyMailboxToken("one.two.extra", secret, now), null);
  assert.equal(await verifyMailboxToken("one.!", secret, now), null);

  for (const payload of [
    { v: 2, address: "alice@example.com", expiresAt: now + 60_000 },
    { v: 1, address: 4, expiresAt: now + 60_000 },
    { v: 1, address: "alice@example.com", expiresAt: "later" },
    { v: 1, address: "alice@example.com", expiresAt: now },
  ]) {
    assert.equal(
      await verifyMailboxToken(await signPayload(payload, secret), secret, now),
      null,
    );
  }

  const invalidJson = toBase64Url("not-json");
  assert.equal(
    await verifyMailboxToken(
      `${invalidJson}.${await signEncodedPayload(invalidJson, secret)}`,
      secret,
      now,
    ),
    null,
  );
});

test("bearer token parsing is strict", () => {
  assert.equal(getBearerToken(), null);
  assert.equal(getBearerToken("Bearer abc.def"), "abc.def");
  assert.equal(getBearerToken("bearer token"), "token");
  assert.equal(getBearerToken("Basic token"), null);
  assert.equal(getBearerToken("Bearer two tokens"), null);
});

test("mailbox addresses must use an explicitly configured domain", () => {
  assert.equal(
    isAllowedMailboxAddress("Alice@Example.com", "example.com, mail.test"),
    true,
  );
  assert.equal(
    isAllowedMailboxAddress("alice@sub.example.com", "example.com"),
    false,
  );
  assert.equal(isAllowedMailboxAddress("not-an-email", "example.com"), false);
  assert.equal(isAllowedMailboxAddress("alice@", "example.com"), false);
  assert.equal(isAllowedMailboxAddress("@example.com", "example.com"), false);
  assert.equal(isAllowedMailboxAddress("alice@example.com", ",  "), false);
});

test("send request schema rejects spoofed sender fields and header injection", () => {
  assert.deepEqual(
    sendRequestSchema.parse({
      receiverEmail: "recipient@example.net",
      subject: "Hello",
      content: "Body",
    }),
    {
      senderName: "",
      receiverEmail: "recipient@example.net",
      subject: "Hello",
      content: "Body",
      type: "text/plain",
    },
  );
  assert.equal(
    sendRequestSchema.safeParse({
      receiverEmail: "recipient@example.net",
      subject: "Hello",
      content: "Body",
      senderEmail: "spoofed@example.net",
    }).success,
    false,
  );
  assert.equal(
    sendRequestSchema.safeParse({
      receiverEmail: "recipient@example.net",
      subject: "Hello\r\nBcc: victim@example.net",
      content: "Body",
    }).success,
    false,
  );
});

test("provider payloads use the configured sender and authenticated reply-to", () => {
  const resendPayload = buildResendPayload(
    outgoingEmail,
    "verified@example.com",
  );
  assert.equal(resendPayload.from, "Alice via tidemail <verified@example.com>");
  assert.equal(resendPayload.reply_to, "alice@example.com");
  assert.equal(
    resendPayload.text,
    "Message body\n\n--\nReply-To: Alice <alice@example.com>",
  );

  const mailChannelsPayload = buildMailChannelsPayload(
    outgoingEmail,
    "verified@example.com",
  ) as any;
  assert.equal(mailChannelsPayload.from.email, "verified@example.com");
  assert.equal(mailChannelsPayload.reply_to.email, "alice@example.com");

  const cloudflareMime = buildCloudflareMimeMessage(
    outgoingEmail,
    "verified@example.com",
  );
  assert.match(cloudflareMime, /^From: .*<verified@example\.com>\r?$/m);
  assert.match(cloudflareMime, /^Reply-To: <alice@example\.com>\r?$/m);
  assert.match(cloudflareMime, /^To: <recipient@example\.net>\r?$/m);
});

test("HTML attribution escapes user-controlled sender metadata", () => {
  const payload = buildResendPayload(
    {
      ...outgoingEmail,
      senderName: "<img src=x onerror=alert(1)>",
      type: "text/html",
      content: "<strong>Allowed message HTML</strong>",
    },
    "verified@example.com",
  );

  assert.match(
    payload.html as string,
    /<strong>Allowed message HTML<\/strong>/,
  );
  assert.doesNotMatch(payload.html as string, /<img src=x/);
  assert.match(payload.html as string, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.equal(escapeHtml(`&<>"'`), "&amp;&lt;&gt;&quot;&#39;");
  assert.equal(escapeHtml("plain text"), "plain text");
});

test("sender attribution supports named and unnamed mailboxes", () => {
  assert.equal(getProviderSenderName(outgoingEmail), "Alice via tidemail");
  assert.equal(
    getProviderSenderName({ ...outgoingEmail, senderName: "" }),
    "tidemail",
  );
  assert.equal(
    appendSenderAttribution({ ...outgoingEmail, senderName: "" }),
    "Message body\n\n--\nReply-To: alice@example.com",
  );
  assert.match(
    appendSenderAttribution({ ...outgoingEmail, type: "text/html" }),
    /Reply-To: Alice &lt;alice@example.com&gt;/,
  );
});

async function signPayload(payload: unknown, secret: string): Promise<string> {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${await signEncodedPayload(encodedPayload, secret)}`;
}

async function signEncodedPayload(
  encodedPayload: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload),
  );
  return toBase64Url(new Uint8Array(signature));
}

function toBase64Url(value: string | Uint8Array): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
