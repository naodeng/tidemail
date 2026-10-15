import assert from "node:assert/strict";
import test from "node:test";
import { decrypt, encrypt } from "./utils.ts";

test("mailbox password obfuscation round-trips mailbox addresses", () => {
  const address = "alice+temporary@example.net";
  const encoded = encrypt(address, "cookie-secret");

  assert.notEqual(encoded, address);
  assert.equal(decrypt(encoded, "cookie-secret"), address);
  assert.notEqual(decrypt(encoded, "different-secret"), address);
});

test("mailbox password obfuscation handles empty values", () => {
  assert.equal(encrypt("", "cookie-secret"), "");
  assert.equal(decrypt("", "cookie-secret"), "");
  assert.equal(
    decrypt(encrypt("inbox@example.net", ""), ""),
    "inbox@example.net",
  );
});
