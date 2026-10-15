import assert from "node:assert/strict";
import test from "node:test";
import { getD1DB } from "./db.ts";

test("D1 bindings are wrapped in the Drizzle database interface", () => {
  const db = getD1DB({} as D1Database);

  assert.equal(typeof db.select, "function");
  assert.equal(typeof db.insert, "function");
  assert.equal(typeof db.delete, "function");
});
