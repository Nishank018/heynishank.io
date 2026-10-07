import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";

const contactMessage = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(4000),
});
export async function POST(request: Request) {
  const limit = await checkRateLimit(request, "contact");
  if (!limit.success)
    return NextResponse.json(
      { error: "rate_limited", retryAfter: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const parsed = contactMessage.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_EMAIL;
  const sender = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !recipient || !sender)
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: sender,
      to: recipient,
      replyTo: parsed.data.email,
      subject: "New portfolio contact form message",
      text: `Name: ${parsed.data.name}\nReply-to: ${parsed.data.email}\n\n${parsed.data.message}`,
    });
    if (error) return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }
}
