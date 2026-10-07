# Nishank Gupta — Personal Portfolio

This repository contains my personal portfolio website. I’m Nishank Gupta, a 23-year-old developer based in Lucknow, India. My background is in full-stack development, and I’m currently learning by building practical AI applications while I explore where I want to specialize.

The site is a place to introduce myself, share selected projects and experience, show the tools I work with, and make it easy to get in touch. It presents my AI engineering direction as work in progress rather than claiming a specialty I haven’t settled on yet.

## What’s in the site

- A responsive portfolio with About, Projects, Experience, Skills, Resume, and Contact sections.
- Project case studies loaded from local content, with an optional PostgreSQL-backed project store and private project editor.
- A portfolio chat demo that currently uses deterministic responses based on the site content; it is not connected to a live LLM.
- A contact form that can send messages through Resend when configured.
- Light and dark themes, page transitions, and a command palette.
- Optional GitHub sign-in for the private project editor, plus optional Upstash rate limiting.

Project descriptions and statuses live in `content/projects.ts`; profile, social links, and About copy live in `content/site.ts`. Experience and skills are maintained in `content/experience.ts` and `content/skills.ts`.

## Built with

- Next.js 15, React 19, and TypeScript
- Tailwind CSS, custom CSS, Geist Pixel typography, and Framer Motion
- Drizzle ORM with PostgreSQL for optional project storage
- Auth.js with GitHub sign-in for the optional private editor
- AI SDK for the chat interface and streamed demo responses
- Upstash Redis for optional rate limiting and Resend for optional contact delivery

## Run locally

Requires Node.js and pnpm. Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Most portfolio pages work without external service credentials. To configure optional integrations, copy `.env.example` to `.env.local` and fill in only the services you plan to use. See [`docs/PHASE4_SETUP.md`](docs/PHASE4_SETUP.md) for database, editor, rate-limit, contact delivery, and site URL setup.

Useful project commands:

```bash
pnpm build       # Build the production site
pnpm start       # Serve the production build
pnpm lint        # Run ESLint
pnpm typecheck   # Check TypeScript types
```

## Project status

This is an evolving personal portfolio. Some project entries are experiments or works in progress, and the site labels them accordingly. The chat is a UI and portfolio-navigation demo while I explore AI application development.
