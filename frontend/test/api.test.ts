import assert from "node:assert/strict";
import test from "node:test";
import {
  deleteEmails,
  getEmailById,
  getEmails,
  getMailboxMeta,
  getUnlockStatus,
  loginByPassword,
  refreshMailboxToken,
  unlockSite,
  verifyTurnstile,
} from "../src/services/api.ts";

function mockFetch(
  t: Parameters<Parameters<typeof test>[1]>[0],
  handler: typeof fetch,
) {
  t.mock.method(globalThis, "fetch", handler);
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("mailbox email and metadata requests send their address and return data", async (t) => {
  mockFetch(t, async (input, init) => {
    const url = String(input);
    assert.equal(init?.method, "POST");
    if (url.endsWith("/emails")) {
      assert.deepEqual(JSON.parse(String(init?.body)), {
        address: "inbox@example.net",
        limit: 5,
      });
      return jsonResponse([{ id: "mail-1" }]);
    }
    assert.equal(url, "/api/emails/meta");
    assert.deepEqual(JSON.parse(String(init?.body)), {
      address: "inbox@example.net",
    });
    return jsonResponse({
      count: 1,
      latestEmailCreatedAt: "2026-10-15T00:00:00.000Z",
    });
  });

  assert.deepEqual(await getEmails("inbox@example.net", 5), [{ id: "mail-1" }]);
  assert.deepEqual(await getMailboxMeta("inbox@example.net"), {
    count: 1,
    latestEmailCreatedAt: "2026-10-15T00:00:00.000Z",
  });
});

test("mailbox reads and deletion reject unsuccessful responses", async (t) => {
  mockFetch(t, async () => new Response("", { status: 500 }));

  await assert.rejects(
    getEmails("inbox@example.net"),
    /Network response was not ok/,
  );
  await assert.rejects(
    getMailboxMeta("inbox@example.net"),
    /Failed to fetch mailbox meta/,
  );
  await assert.rejects(getEmailById("mail-1"), /Failed to fetch email/);
  await assert.rejects(deleteEmails(["mail-1"]), /Failed to delete emails/);
});

test("Turnstile verification supports optional tokens and reports server errors", async (t) => {
  const bodies: unknown[] = [];
  mockFetch(t, async (_input, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    return jsonResponse({ success: true, mailbox: "inbox@example.net" });
  });

  assert.deepEqual(await verifyTurnstile("example.net", "captcha-token"), {
    success: true,
    mailbox: "inbox@example.net",
  });
  await verifyTurnstile("example.net");
  assert.deepEqual(bodies, [
    { token: "captcha-token", domain: "example.net" },
    { domain: "example.net" },
  ]);

  mockFetch(t, async () => jsonResponse({ message: "domain rejected" }, 400));
  await assert.rejects(verifyTurnstile("invalid.example"), /domain rejected/);

  mockFetch(t, async () => jsonResponse({ message: "" }, 400));
  await assert.rejects(
    verifyTurnstile("invalid.example"),
    /Turnstile verification failed/,
  );
});

test("mailbox login and authorization refresh return credentials", async (t) => {
  mockFetch(t, async (input, init) => {
    if (String(input).endsWith("/login")) {
      assert.deepEqual(JSON.parse(String(init?.body)), { password: "secret" });
      return jsonResponse({
        address: "inbox@example.net",
        mailboxToken: "token-1",
      });
    }
    assert.equal(
      new Headers(init?.headers).get("Authorization"),
      "Bearer token-1",
    );
    return jsonResponse({ mailboxToken: "token-2" });
  });

  assert.deepEqual(await loginByPassword("secret"), {
    address: "inbox@example.net",
    mailboxToken: "token-1",
  });
  assert.equal(await refreshMailboxToken("token-1"), "token-2");
});

test("mailbox login and authorization refresh surface server errors", async (t) => {
  mockFetch(t, async () => jsonResponse({ message: "wrong password" }, 401));

  await assert.rejects(loginByPassword("wrong"), /wrong password/);
  await assert.rejects(refreshMailboxToken("expired"), /wrong password/);

  mockFetch(t, async () => new Response("not-json", { status: 401 }));
  await assert.rejects(loginByPassword("wrong"));
  await assert.rejects(refreshMailboxToken("expired"));

  mockFetch(t, async () => jsonResponse({ message: "" }, 401));
  await assert.rejects(loginByPassword("wrong"), /Login failed/);
  await assert.rejects(
    refreshMailboxToken("expired"),
    /Failed to refresh mailbox authorization/,
  );
});

test("site unlock status, unlock success, and errors are handled", async (t) => {
  mockFetch(t, async (input, init) => {
    if (String(input) === "/auth/status") {
      return jsonResponse({ unlocked: true, sitePasswordEnabled: true });
    }
    assert.deepEqual(JSON.parse(String(init?.body)), {
      password: "site-secret",
    });
    return jsonResponse({ success: true });
  });

  assert.deepEqual(await getUnlockStatus(), {
    unlocked: true,
    sitePasswordEnabled: true,
  });
  assert.deepEqual(await unlockSite("site-secret"), { success: true });

  mockFetch(t, async () => new Response("", { status: 500 }));
  await assert.rejects(getUnlockStatus(), /Failed to fetch unlock status/);
  await assert.rejects(unlockSite("bad"), SyntaxError);

  mockFetch(t, async () => jsonResponse({ message: "Password rejected" }, 401));
  await assert.rejects(unlockSite("bad"), /Password rejected/);

  mockFetch(t, async () => jsonResponse({ message: "" }, 401));
  await assert.rejects(unlockSite("bad"), /Invalid password/);
});

test("mail details and deletion return server data", async (t) => {
  mockFetch(t, async (input, init) => {
    if (String(input).endsWith("/mail-1")) {
      assert.equal(init, undefined);
      return jsonResponse({ id: "mail-1", subject: "Hello" });
    }
    assert.deepEqual(JSON.parse(String(init?.body)), { ids: ["mail-1"] });
    return jsonResponse({ count: 1 });
  });

  assert.deepEqual(await getEmailById("mail-1"), {
    id: "mail-1",
    subject: "Hello",
  });
  assert.deepEqual(await deleteEmails(["mail-1"]), { count: 1 });
});
