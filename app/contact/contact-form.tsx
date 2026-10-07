"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      }),
    });
    const result = (await response.json()) as { error?: string };
    setStatus(
      response.ok
        ? "Message sent."
        : result.error === "not_configured"
          ? "Contact delivery is not configured yet."
          : "Could not send your message. Please try again later.",
    );
    setBusy(false);
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        Name
        <input name="name" required maxLength={80} autoComplete="name" />
      </label>
      <label>
        Your email
        <input name="email" type="email" required maxLength={254} autoComplete="email" />
      </label>
      <label>
        Message
        <textarea name="message" required minLength={10} maxLength={4000} rows={6} />
      </label>
      <button className="outline-action" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
      <p role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
