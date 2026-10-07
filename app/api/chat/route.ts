import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { z } from "zod";
import { getMockReply, type ChatInputMessage } from "@/lib/chat/handler";
import { checkRateLimit } from "@/lib/rate-limit";

const requestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(40),
  sessionId: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const simulate = new URL(request.url).searchParams.get("simulate");
  if (simulate === "429")
    return Response.json({ error: "rate_limited", retryAfter: 8 }, { status: 429 });
  if (simulate === "500") return Response.json({ error: "server_error" }, { status: 500 });

  const limit = await checkRateLimit(request, "chat");
  if (!limit.success)
    return Response.json(
      { error: "rate_limited", retryAfter: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  const { reply, sources } = await getMockReply(parsed.data.messages as ChatInputMessage[]);
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const messageId = crypto.randomUUID();
      const textId = crypto.randomUUID();
      writer.write({ type: "start", messageId });
      writer.write({ type: "text-start", id: textId });
      for (const source of sources) {
        writer.write({ type: "source-url", sourceId: crypto.randomUUID(), ...source });
      }
      const words = reply.split(/(\s+)/).filter(Boolean);
      for (const delta of words) {
        writer.write({ type: "text-delta", id: textId, delta });
        await new Promise((resolve) => setTimeout(resolve, 34));
      }
      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}
