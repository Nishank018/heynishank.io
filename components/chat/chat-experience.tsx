"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowDown, ArrowUp, Bot, Check, Copy, RotateCcw, Square, X } from "lucide-react";
import { usePortfolioChat } from "@/components/chat/chat-provider";

const starters = [
  "What are your best AI projects?",
  "Summarize your experience",
  "What is your tech stack?",
  "Are you open to work?",
];

function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = String(children ?? "").replace(/\n$/, "");
  async function copyCode() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <pre className="chat-code">
      <button type="button" onClick={copyCode} aria-label="Copy code">
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
      <code>{children}</code>
    </pre>
  );
}

function MessageText({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre: ({ children: content }) => <CodeBlock>{content}</CodeBlock>,
        a: ({ href, children: label }) => (
          <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
            {label}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

export function ChatExperience({
  mode = "page",
  onClose,
}: {
  mode?: "page" | "panel";
  onClose?: () => void;
}) {
  const { messages, status, error, retrySeconds, online, send, retry, stop, reset, clearError } =
    usePortfolioChat();
  const [input, setInput] = useState("");
  const [nearBottom, setNearBottom] = useState(true);
  const [copiedId, setCopiedId] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const formInput = useRef<HTMLInputElement>(null);
  const busy = status === "submitted" || status === "streaming";
  const latest = useRef(messages.length);

  useEffect(() => {
    if (nearBottom)
      scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, nearBottom]);
  useEffect(() => {
    if (mode !== "panel") return;
    formInput.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
      if (event.key === "Tab" && scroller.current?.closest(".agent-panel")) {
        const panel = scroller.current.closest<HTMLElement>(".agent-panel");
        if (!panel) return;
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled),a[href]"),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);
  useEffect(() => {
    if (messages.length > latest.current && mode === "panel") formInput.current?.focus();
    latest.current = messages.length;
  }, [messages.length, mode]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    if (!online) {
      setInput(text);
      return;
    }
    clearError();
    send(text);
    setInput("");
    setNearBottom(true);
  }
  async function copyMessage(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(""), 1400);
  }
  function handleInputKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && mode === "panel") onClose?.();
  }

  return (
    <section className={`agent-chat agent-chat--${mode}`} aria-label="Portfolio chat prototype">
      <header className="agent-header">
        <div className="agent-mark">
          <Bot size={17} />
        </div>
        <div className="agent-header__copy">
          <b>Portfolio Chat</b>
          <span>
            <i className={online ? "online" : "offline"} /> MOCK RESPONSES ·{" "}
            {online ? "READY" : "OFFLINE"}
          </span>
        </div>
        <button
          className="agent-icon-button"
          type="button"
          title="Reset conversation"
          aria-label="Reset conversation"
          onClick={reset}
        >
          <RotateCcw size={15} />
        </button>
        {onClose && (
          <button
            className="agent-icon-button"
            type="button"
            title="Close chat"
            aria-label="Close chat"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        )}
      </header>
      <div
        className="agent-transcript"
        ref={scroller}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        onScroll={(event) => {
          const node = event.currentTarget;
          setNearBottom(node.scrollHeight - node.scrollTop - node.clientHeight < 120);
        }}
      >
        {messages.length === 0 && (
          <div className="agent-welcome">
            <div className="agent-welcome__icon">
              <Bot size={22} />
            </div>
            <div className="agent-label">PORTFOLIO CHAT PROTOTYPE</div>
            <h2>What are you looking for?</h2>
            <p>
              I can find relevant projects, explain Nishank’s experience, or guide you to the right
              page.
            </p>
            <div className="agent-starters">
              {starters.map((starter) => (
                <button
                  type="button"
                  key={starter}
                  onClick={() => {
                    send(starter);
                    setNearBottom(true);
                  }}
                >
                  {starter}
                  <ArrowUp size={12} />
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => {
          const text = message.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("");
          const sources = message.parts.filter((part) => part.type === "source-url");
          return (
            <article className={`agent-message agent-message--${message.role}`} key={message.id}>
              <div className="agent-message__role">
                {message.role === "assistant" ? "NISHANK AI · AGENT" : "YOU"}
              </div>
              <div className="agent-message__body">
                {message.role === "assistant" ? <MessageText>{text}</MessageText> : <p>{text}</p>}
              </div>
              {message.role === "assistant" && (
                <>
                  {sources.length > 0 && (
                    <div className="agent-sources">
                      <span>Sources</span>
                      {sources.map((part) =>
                        part.type === "source-url" ? (
                          <Link key={part.sourceId} href={part.url}>
                            {part.title ?? "Portfolio"}
                            <ArrowUp size={10} />
                          </Link>
                        ) : null,
                      )}
                    </div>
                  )}
                  <button
                    className="agent-copy"
                    type="button"
                    onClick={() => void copyMessage(message.id, text)}
                  >
                    {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}{" "}
                    {copiedId === message.id ? "Copied" : "Copy"}
                  </button>
                </>
              )}
            </article>
          );
        })}
        {status === "submitted" && (
          <div className="agent-typing">
            <i />
            <i />
            <i />
            <span>Reviewing portfolio context…</span>
          </div>
        )}
        {status === "streaming" &&
          messages.at(-1)?.role === "assistant" &&
          messages.at(-1)?.parts.every((part) => part.type !== "text" || !part.text) && (
            <div className="agent-typing">
              <i />
              <i />
              <i />
              <span>Finding a useful answer…</span>
            </div>
          )}
        {error && (
          <div
            className={`agent-error ${error.status === 429 ? "agent-error--rate" : ""}`}
            role="alert"
          >
            {!online
              ? "You appear to be offline. Check your connection and retry."
              : error.status === 429
                ? `The agent is taking a short break. ${retrySeconds > 0 ? `Retry in ${retrySeconds}s.` : "You can try again now."}`
                : error.status === 500
                  ? "The agent hit a temporary error."
                  : "The request failed. Please try again."}
            <button type="button" disabled={retrySeconds > 0 || !online} onClick={retry}>
              {retrySeconds > 0 ? `Wait ${retrySeconds}s` : "Retry"}
            </button>
          </div>
        )}
        <div className="agent-bottom" />
      </div>
      {!nearBottom && (
        <button
          className="agent-jump"
          type="button"
          onClick={() => {
            scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
            setNearBottom(true);
          }}
        >
          <ArrowDown size={13} /> Jump to latest
        </button>
      )}
      <form className="agent-composer" onSubmit={submit}>
        <input
          ref={formInput}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleInputKey}
          disabled={busy}
          aria-label="Ask the portfolio agent"
          placeholder={
            online ? "Ask about projects, experience, or roles…" : "Offline — check your connection"
          }
        />
        {busy ? (
          <button type="button" aria-label="Stop response" title="Stop response" onClick={stop}>
            <Square size={13} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || !online}
            aria-label="Send to agent"
            title="Send to agent"
          >
            <ArrowUp size={15} />
          </button>
        )}
      </form>
      <footer className="agent-disclaimer">
        MOCK AGENT · SOURCE-LINKED DEMO · ANSWERS MAY BE INACCURATE
      </footer>
    </section>
  );
}

export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { messages } = usePortfolioChat();
  const bubble = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (pathname === "/chat") setOpen(false);
  }, [pathname]);
  if (pathname === "/chat") return null;
  return (
    <>
      <button
        ref={bubble}
        type="button"
        className="agent-bubble"
        aria-label={open ? "Close portfolio chat prototype" : "Open portfolio chat prototype"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Bot size={20} />}
        {messages.length > 0 && !open && <span className="agent-bubble__dot" />}
      </button>
      {open && (
        <div
          className="agent-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Portfolio chat prototype"
        >
          <ChatExperience
            mode="panel"
            onClose={() => {
              setOpen(false);
              window.setTimeout(() => bubble.current?.focus(), 0);
            }}
          />
        </div>
      )}
    </>
  );
}
