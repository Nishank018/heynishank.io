# Portfolio Agent Contract

The site exposes a provider-independent mock endpoint so the chat experience can be tested before a model backend is connected.

## Request

`POST /api/chat`

```json
{
  "messages": [{ "role": "user", "content": "What are your best AI projects?" }],
  "sessionId": "session-id"
}
```

Only `user` and `assistant` messages are accepted. Each message is limited to 4,000 characters and the history to 40 messages.

## Success

The endpoint streams an AI SDK UI message response. Text arrives incrementally; URL source annotations are attached to the assistant message. Sources link to portfolio pages or sections.

## Errors

- `400`: `{ "error": "invalid_request" }`
- `429`: `{ "error": "rate_limited", "retryAfter": 8 }`
- `500`: `{ "error": "server_error" }`

Add `?simulate=429` or `?simulate=500` to `/api/chat` to test those states. Simulated responses are intentionally disabled for no other behavior.

The mock agent is in `lib/chat/handler.ts`; replace its deterministic intent routing with a real backend there. Keep credentials and provider code server-side. The chat UI depends only on the endpoint contract and the AI SDK transport, not on a specific model provider.
