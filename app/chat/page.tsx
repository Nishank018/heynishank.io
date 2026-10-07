import type { Metadata } from "next";
import { ChatPage } from "@/components/chat/chat-page";

export const metadata: Metadata = {
  title: "Portfolio Chat Prototype — Nishank Gupta",
  description:
    "Try a portfolio chat prototype with deterministic mock responses about Nishank’s work and experience.",
};
export default function Page() {
  return <ChatPage />;
}
