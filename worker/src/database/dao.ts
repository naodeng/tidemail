import { count, desc, eq, inArray, lt, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { emails, sendRateLimits } from "./schema.ts";
import type { InsertEmail } from "./schema.ts";

export async function insertEmail(db: DrizzleD1Database, email: InsertEmail) {
  try {
    await db.insert(emails).values(email).execute();
  } catch (error) {
    console.error(error);
  }
}

export async function findEmailById(db: DrizzleD1Database, id: string) {
  try {
    const result = await db
      .select()
      .from(emails)
      .where(eq(emails.id, id))
      .execute();
    return result.length === 1 ? result[0] : null;
  } catch {
    return null;
  }
}

export async function getEmailsByMessageTo(
  db: DrizzleD1Database,
  messageTo: string,
  limit?: number,
) {
  try {
    let query = db
      .select()
      .from(emails)
      .where(eq(emails.messageTo, messageTo))
      .orderBy(desc(emails.createdAt));

    if (limit && limit > 0) {
      query = query.limit(limit) as typeof query;
    }

    return await query.execute();
  } catch {
    return [];
  }
}

export async function getMailboxMetaByAddress(
  db: DrizzleD1Database,
  address: string,
): Promise<{ count: number; latestEmailCreatedAt: string | null }> {
  try {
    const [countResult, latestResult] = await Promise.all([
      db
        .select({ count: count() })
        .from(emails)
        .where(eq(emails.messageTo, address))
        .execute(),
      db
        .select({ createdAt: emails.createdAt })
        .from(emails)
        .where(eq(emails.messageTo, address))
        .orderBy(desc(emails.createdAt))
        .limit(1)
        .execute(),
    ]);

    return {
      count: countResult[0]?.count ?? 0,
      latestEmailCreatedAt: latestResult[0]?.createdAt?.toISOString() ?? null,
    };
  } catch (error) {
    console.error("getMailboxMetaByAddress error:", error);
    return { count: 0, latestEmailCreatedAt: null };
  }
}

export async function deleteEmails(db: DrizzleD1Database, ids: string[]) {
  if (ids.length === 0) {
    return { count: 0 };
  }

  try {
    const result = await db.delete(emails).where(inArray(emails.id, ids));
    return { count: result.rowsAffected };
  } catch (error) {
    console.error(error);
    return { count: 0 };
  }
}

export async function deleteExpiredEmails(
  db: DrizzleD1Database,
  expirationTime: Date,
) {
  try {
    const result = await db
      .delete(emails)
      .where(lt(emails.createdAt, expirationTime))
      .execute();
    return { count: result.rowsAffected };
  } catch (error) {
    console.error("Failed to remove expired email:", error);
    return { count: 0 };
  }
}

export async function incrementAndGetSendRateWindowCount(
  db: DrizzleD1Database,
  identifier: string,
  windowStartEpochSec: number,
): Promise<number> {
  try {
    const result = await db
      .insert(sendRateLimits)
      .values({ identifier, windowStartEpochSec, requestCount: 1 })
      .onConflictDoUpdate({
        target: [sendRateLimits.identifier, sendRateLimits.windowStartEpochSec],
        set: {
          requestCount: sql`${sendRateLimits.requestCount} + 1`,
        },
      })
      .returning({ requestCount: sendRateLimits.requestCount })
      .execute();

    return result[0]?.requestCount ?? 1;
  } catch (error) {
    console.error("incrementAndGetSendRateWindowCount error:", error);
    return 1;
  }
}

export async function deleteExpiredSendRateLimits(
  db: DrizzleD1Database,
  expirationEpochSec: number,
) {
  try {
    const result = await db
      .delete(sendRateLimits)
      .where(lt(sendRateLimits.windowStartEpochSec, expirationEpochSec))
      .execute();
    return { count: result.rowsAffected };
  } catch (error) {
    console.error("Failed to remove expired send rate limits:", error);
    return { count: 0 };
  }
}
