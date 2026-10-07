"use client";

import { useEffect, useRef } from "react";
import { ChatExperience } from "@/components/chat/chat-experience";
import { usePortfolioChat } from "@/components/chat/chat-provider";

export function ChatPage() {
  const { messages, send, ready } = usePortfolioChat();
  const consumed = useRef(false);
  useEffect(() => {
    if (consumed.current || !ready) return;
    const prompt = new URLSearchParams(window.location.search).get("q");
    if (!prompt) return;
    consumed.current = true;
    send(prompt.slice(0, 4000));
    window.history.replaceState({}, "", "/chat");
  }, [messages.length, ready, send]);
  return (
    <main className="chat-page">
      <div className="chat-page__intro">
        <span>PORTFOLIO AGENT / NISHANK AI</span>
        <h1>Find your way around my work.</h1>
        <p>Ask for a project, experience summary, or the right next step.</p>
      </div>
      <ChatExperience mode="page" />
    </main>
  );
}
