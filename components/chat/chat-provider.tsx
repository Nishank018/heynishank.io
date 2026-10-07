"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

type ChatError = Error & { status?: number; retryAfter?: number };
type PortfolioChat = {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error?: ChatError;
  retrySeconds: number;
  online: boolean;
  ready: boolean;
  send: (text: string) => void;
  retry: () => void;
  stop: () => void;
  reset: () => void;
  clearError: () => void;
};
const ChatContext = createContext<PortfolioChat | null>(null);
const STORAGE_ID = "portfolio-agent-session-id";
const STORAGE_MESSAGES = "portfolio-agent-messages";

class ChatRequestError extends Error {
  status?: number;
  retryAfter?: number;
  constructor(message: string, status?: number, retryAfter?: number) {
    super(message);
    this.name = "ChatRequestError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function getSessionId() {
  if (typeof window === "undefined") return "portfolio-agent";
  const existing = window.sessionStorage.getItem(STORAGE_ID);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(STORAGE_ID, id);
  return id;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessionId] = useState(getSessionId);
  const [hydrated, setHydrated] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const [online, setOnline] = useState(true);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            sessionId: id,
            messages: messages.map((message) => ({
              role: message.role,
              content: message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join(""),
            })),
          },
        }),
        fetch: async (input, init) => {
          const url = new URL(
            typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
            window.location.origin,
          );
          const simulation = new URLSearchParams(window.location.search).get("simulate");
          if (simulation === "429" || simulation === "500")
            url.searchParams.set("simulate", simulation);
          const response = await fetch(url, init);
          if (response.ok) return response;
          const payload = (await response
            .clone()
            .json()
            .catch(() => ({}))) as { error?: string; retryAfter?: number };
          throw new ChatRequestError(
            payload.error ?? "The request could not be completed.",
            response.status,
            payload.retryAfter,
          );
        },
      }),
    [],
  );
  const chat = useChat({
    id: sessionId,
    transport,
    onError: (error) => {
      const requestError = error as ChatError;
      if (requestError.status === 429) setRetrySeconds(requestError.retryAfter ?? 8);
    },
  });

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_MESSAGES);
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const restored: UIMessage[] = parsed.flatMap((item): UIMessage[] => {
            if (
              typeof item !== "object" ||
              item === null ||
              !("role" in item) ||
              !("id" in item) ||
              !("text" in item)
            )
              return [];
            const row = item as { role: unknown; id: unknown; text: unknown };
            if (
              (row.role !== "user" && row.role !== "assistant") ||
              typeof row.id !== "string" ||
              typeof row.text !== "string"
            )
              return [];
            return [{ id: row.id, role: row.role, parts: [{ type: "text", text: row.text }] }];
          });
          if (restored.length) chat.setMessages(restored);
        }
      } catch {
        sessionStorage.removeItem(STORAGE_MESSAGES);
      }
    }
    setHydrated(true);
    // Load the session transcript once, then preserve it across route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const transcript = chat.messages.slice(-40).map((message) => ({
      id: message.id,
      role: message.role,
      text: message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(""),
    }));
    sessionStorage.setItem(STORAGE_MESSAGES, JSON.stringify(transcript));
  }, [chat.messages, hydrated]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);
  useEffect(() => {
    if (retrySeconds <= 0) return;
    const timer = window.setTimeout(() => setRetrySeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [retrySeconds]);

  const value: PortfolioChat = {
    messages: chat.messages,
    status: chat.status,
    error: chat.error as ChatError | undefined,
    retrySeconds,
    online,
    ready: hydrated,
    send: (text) => {
      setRetrySeconds(0);
      chat.clearError();
      chat.sendMessage({ text });
    },
    retry: () => {
      setRetrySeconds(0);
      chat.clearError();
      void chat.regenerate();
    },
    stop: chat.stop,
    reset: () => {
      chat.stop();
      chat.setMessages([]);
      chat.clearError();
      setRetrySeconds(0);
      sessionStorage.removeItem(STORAGE_MESSAGES);
    },
    clearError: chat.clearError,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function usePortfolioChat() {
  const value = useContext(ChatContext);
  if (!value) throw new Error("usePortfolioChat must be used inside ChatProvider");
  return value;
}
