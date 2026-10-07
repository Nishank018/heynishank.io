import type { Metadata } from "next";
import { InnerPage } from "@/components/sections/inner-page";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact — Nishank Gupta",
  description: "Send Nishank Gupta a message.",
};
export default function ContactPage() {
  return (
    <InnerPage
      route="contact"
      title="Get in touch"
      subtitle="Have a project or opportunity in mind? Send me a note."
    >
      <ContactForm />
    </InnerPage>
  );
}
