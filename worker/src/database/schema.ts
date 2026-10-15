import { integer, index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

export type Header = Record<string, string>;

export type Address = {
  address: string;
  name: string;
};

export const emails = sqliteTable(
  "emails",
  {
    id: text("id").primaryKey(),
    messageFrom: text("message_from").notNull(),
    messageTo: text("message_to").notNull(),
    headers: text("headers", { mode: "json" }).$type<Header[]>().notNull(),
    from: text("from", { mode: "json" }).$type<Address>().notNull(),
    sender: text("sender", { mode: "json" }).$type<Address>(),
    replyTo: text("reply_to", { mode: "json" }).$type<Address[]>(),
    deliveredTo: text("delivered_to"),
    returnPath: text("return_path"),
    to: text("to", { mode: "json" }).$type<Address[]>(),
    cc: text("cc", { mode: "json" }).$type<Address[]>(),
    bcc: text("bcc", { mode: "json" }).$type<Address[]>(),
    subject: text("subject"),
    messageId: text("message_id").notNull(),
    inReplyTo: text("in_reply_to"),
    references: text("references"),
    date: text("date"),
    html: text("html"),
    text: text("text"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    messageToCreatedAtIdx: index("idx_emails_message_to_created_at").on(
      table.messageTo,
      table.createdAt,
    ),
  }),
);

const AddressSchema = z.object({
  address: z.string(),
  name: z.string(),
});

export const insertEmailSchema = createInsertSchema(emails, {
  headers: z.array(z.record(z.string())),
  from: AddressSchema,
  sender: AddressSchema.optional(),
  replyTo: z.array(AddressSchema).optional(),
  to: z.array(AddressSchema).optional(),
  cc: z.array(AddressSchema).optional(),
  bcc: z.array(AddressSchema).optional(),
});

export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;

export const sendRateLimits = sqliteTable(
  "send_rate_limits",
  {
    identifier: text("identifier").notNull(),
    windowStartEpochSec: integer("window_start_epoch_sec").notNull(),
    requestCount: integer("request_count").default(0).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.identifier, table.windowStartEpochSec],
    }),
    windowIdx: index("idx_send_rate_limits_window").on(
      table.windowStartEpochSec,
    ),
  }),
);
