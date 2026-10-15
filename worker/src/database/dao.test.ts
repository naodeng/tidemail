import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
  deleteEmails,
  deleteExpiredEmails,
  deleteExpiredSendRateLimits,
  findEmailById,
  getEmailsByMessageTo,
  getMailboxMetaByAddress,
  incrementAndGetSendRateWindowCount,
  insertEmail,
} from "./dao.ts";
import type { InsertEmail } from "./schema.ts";

const migrationFiles = [
  "0000_sturdy_arclight.sql",
  "0001_add_api_tables.sql",
  "0002_add_site_stats.sql",
  "0003_access_control_daily_stats_rate_limit.sql",
  "0004_simplify_product.sql",
];

async function createDatabase() {
  const client = createClient({ url: "file::memory:" });
  for (const file of migrationFiles) {
    const sql = await readFile(
      new URL(`../../drizzle/${file}`, import.meta.url),
      "utf8",
    );
    await client.executeMultiple(sql);
  }
  return {
    client,
    db: drizzle(client) as unknown as DrizzleD1Database,
  };
}

function makeEmail(id: string, createdAt: Date): InsertEmail {
  return {
    id,
    messageFrom: "sender@example.com",
    messageTo: "inbox@example.net",
    headers: [],
    from: { address: "sender@example.com", name: "Sender" },
    messageId: `<${id}@example.com>`,
    createdAt,
    updatedAt: createdAt,
  };
}

test("email DAO stores, lists, counts, and deletes mailbox messages", async (t) => {
  const { client, db } = await createDatabase();
  t.after(() => client.close());

  const oldest = makeEmail("oldest", new Date("2026-10-01T00:00:00.000Z"));
  const newest = makeEmail("newest", new Date("2026-10-02T00:00:00.000Z"));
  await insertEmail(db, oldest);
  await insertEmail(db, newest);

  assert.equal((await findEmailById(db, "newest"))?.subject, null);
  assert.equal(await findEmailById(db, "missing"), null);
  assert.deepEqual(
    (await getEmailsByMessageTo(db, "inbox@example.net")).map(({ id }) => id),
    ["newest", "oldest"],
  );
  assert.deepEqual(
    (await getEmailsByMessageTo(db, "inbox@example.net", 1)).map(
      ({ id }) => id,
    ),
    ["newest"],
  );
  assert.deepEqual(
    (await getEmailsByMessageTo(db, "inbox@example.net", 0)).map(
      ({ id }) => id,
    ),
    ["newest", "oldest"],
  );
  assert.deepEqual(await getMailboxMetaByAddress(db, "inbox@example.net"), {
    count: 2,
    latestEmailCreatedAt: "2026-10-02T00:00:00.000Z",
  });
  assert.deepEqual(await getMailboxMetaByAddress(db, "empty@example.net"), {
    count: 0,
    latestEmailCreatedAt: null,
  });
  assert.deepEqual(await deleteEmails(db, ["newest"]), { count: 1 });
  assert.deepEqual(await deleteEmails(db, []), { count: 0 });
  assert.deepEqual(
    await deleteExpiredEmails(db, new Date("2026-10-02T00:00:00.000Z")),
    { count: 1 },
  );
  assert.deepEqual(await getEmailsByMessageTo(db, "inbox@example.net"), []);
});

test("send rate limiting increments fixed windows and removes old buckets", async (t) => {
  const { client, db } = await createDatabase();
  t.after(() => client.close());

  assert.equal(
    await incrementAndGetSendRateWindowCount(db, "send-ip:192.0.2.1", 100),
    1,
  );
  assert.equal(
    await incrementAndGetSendRateWindowCount(db, "send-ip:192.0.2.1", 100),
    2,
  );
  assert.equal(
    await incrementAndGetSendRateWindowCount(db, "send-ip:192.0.2.1", 200),
    1,
  );
  assert.deepEqual(await deleteExpiredSendRateLimits(db, 150), { count: 1 });
  assert.equal(
    await incrementAndGetSendRateWindowCount(db, "send-ip:192.0.2.1", 200),
    2,
  );
});

test("the product migration clears prior mail and drops retired tables", async (t) => {
  const client = createClient({ url: "file::memory:" });
  t.after(() => client.close());

  for (const file of migrationFiles.slice(0, -1)) {
    const sql = await readFile(
      new URL(`../../drizzle/${file}`, import.meta.url),
      "utf8",
    );
    await client.executeMultiple(sql);
  }
  await client.execute({
    sql: 'INSERT INTO emails (id, message_from, message_to, headers, "from", message_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      "old-mail",
      "a@example.com",
      "b@example.net",
      "[]",
      "{}",
      "<old>",
      1,
      1,
    ],
  });

  const migration = await readFile(
    new URL("../../drizzle/0004_simplify_product.sql", import.meta.url),
    "utf8",
  );
  await client.executeMultiple(migration);

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
  );
  assert.deepEqual(
    tables.rows.map(({ name }) => name),
    ["emails", "send_rate_limits"],
  );
  const emailCount = await client.execute(
    "SELECT COUNT(*) AS count FROM emails",
  );
  assert.equal(Number(emailCount.rows[0].count), 0);
});

test("email and rate-limit DAO methods return safe fallbacks on database errors", async (t) => {
  const originalError = console.error;
  console.error = () => {};
  t.after(() => {
    console.error = originalError;
  });

  const brokenDb = {
    insert() {
      throw new Error("database unavailable");
    },
    select() {
      throw new Error("database unavailable");
    },
    delete() {
      throw new Error("database unavailable");
    },
  } as unknown as DrizzleD1Database;

  await insertEmail(brokenDb, makeEmail("failed", new Date()));
  assert.equal(await findEmailById(brokenDb, "email"), null);
  assert.deepEqual(
    await getEmailsByMessageTo(brokenDb, "inbox@example.net"),
    [],
  );
  assert.deepEqual(
    await getMailboxMetaByAddress(brokenDb, "inbox@example.net"),
    {
      count: 0,
      latestEmailCreatedAt: null,
    },
  );
  assert.deepEqual(await deleteEmails(brokenDb, ["email"]), { count: 0 });
  assert.deepEqual(await deleteExpiredEmails(brokenDb, new Date()), {
    count: 0,
  });
  assert.equal(
    await incrementAndGetSendRateWindowCount(brokenDb, "send-ip:test", 100),
    1,
  );
  assert.deepEqual(await deleteExpiredSendRateLimits(brokenDb, 100), {
    count: 0,
  });
});

test("metadata and rate-limit DAO methods handle empty query results", async () => {
  const emptyResultDb = {
    select() {
      const builder = {
        from() {
          return builder;
        },
        where() {
          return builder;
        },
        orderBy() {
          return builder;
        },
        limit() {
          return builder;
        },
        async execute() {
          return [];
        },
      };
      return builder;
    },
    insert() {
      const builder = {
        values() {
          return builder;
        },
        onConflictDoUpdate() {
          return builder;
        },
        returning() {
          return builder;
        },
        async execute() {
          return [];
        },
      };
      return builder;
    },
  } as unknown as DrizzleD1Database;

  assert.deepEqual(
    await getMailboxMetaByAddress(emptyResultDb, "inbox@example.net"),
    { count: 0, latestEmailCreatedAt: null },
  );
  assert.equal(
    await incrementAndGetSendRateWindowCount(
      emptyResultDb,
      "send-ip:test",
      100,
    ),
    1,
  );
});
