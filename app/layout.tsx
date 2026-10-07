import type { Metadata, Viewport } from "next";
import { GeistPixelCircle } from "geist/font/pixel";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RouteMotion } from "@/components/layout/route-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatBubble } from "@/components/chat/chat-experience";
import { ChatProvider } from "@/components/chat/chat-provider";
import "@/styles/tokens.css";
import "./globals.css";
import "@/styles/chat.css";
import "@/styles/admin.css";

export const metadata: Metadata = {
  title: "Nishank Gupta",
  description:
    "Nishank Gupta is a full-stack developer in Lucknow, India, learning to build practical AI applications.",
  icons: {
    icon: [{ url: "/favicon.png?v=2", type: "image/png", sizes: "512x512" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistPixelCircle.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ChatProvider>
            <div className="site-frame">
              <SiteHeader />
              <RouteMotion>{children}</RouteMotion>
              <SiteFooter />
            </div>
            <ChatBubble />
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
