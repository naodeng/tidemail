import { nanoid } from "nanoid/non-secure";
import PostalMime from "postal-mime";
import { insertEmailSchema, type InsertEmail } from "./database/schema.ts";

export interface InboundEmailMessage {
  raw: ReadableStream<Uint8Array>;
  from: string;
  to: string;
}

export async function parseInboundEmail(
  message: InboundEmailMessage,
  id = nanoid(),
  now = new Date(),
): Promise<InsertEmail> {
  const raw = await new Response(message.raw).text();
  const mail = await new PostalMime().parse(raw);

  return insertEmailSchema.parse({
    id,
    messageFrom: message.from,
    messageTo: message.to,
    headers: mail.headers,
    from: mail.from,
    sender: mail.sender,
    replyTo: mail.replyTo,
    deliveredTo: mail.deliveredTo,
    returnPath: mail.returnPath,
    to: mail.to,
    cc: mail.cc,
    bcc: mail.bcc,
    subject: mail.subject,
    messageId: mail.messageId,
    inReplyTo: mail.inReplyTo,
    references: mail.references,
    date: mail.date,
    html: mail.html,
    text: mail.text,
    createdAt: now,
    updatedAt: now,
  });
}
