CREATE TABLE "experiences" (
	"id" text PRIMARY KEY NOT NULL,
	"organization" text NOT NULL,
	"role" text NOT NULL,
	"location" text DEFAULT '',
	"dates" text NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"type" text DEFAULT 'experience' NOT NULL,
	"bullets" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"stack" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_profile" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"name" text DEFAULT 'Nishank Gupta' NOT NULL,
	"location" text DEFAULT 'Lucknow, India' NOT NULL,
	"role_line" text DEFAULT 'AI Engineer in training · Full Stack Developer' NOT NULL,
	"banner_text" text DEFAULT 'Open to AI engineering roles' NOT NULL,
	"role_titles" text[] DEFAULT ARRAY['AI Engineer in training', 'Full-stack developer', '23 · Builder']::text[] NOT NULL,
	"pfp1" text DEFAULT '/profile.png' NOT NULL,
	"pfp2" text DEFAULT '/profile-real.jpg' NOT NULL,
	"about" text[] DEFAULT ARRAY['Hi, I’m Nishank Gupta, a developer based in Lucknow, India. I like learning by building—taking an idea, working through the rough edges, and turning it into something people can use.', 'My background is in full-stack development. During my internship at DRDO, I worked on a network-monitoring dashboard. At GreenIoMart, I’m planning frontend architecture and mapping a WordPress-to-MERN migration for a green-energy marketplace.', 'These days, I’m moving toward AI engineering by experimenting with LLM APIs and building practical AI applications. I’m still exploring where I want to specialize, and I’m looking for opportunities to keep learning, contribute, and ship useful products.']::text[] NOT NULL,
	"quote" text DEFAULT '“Code is read much more often than it is written, so plan for clarity, ship with discipline, and build things that genuinely help people.”',
	"quote_author" text DEFAULT 'Nishank Gupta',
	"resume_url" text DEFAULT '',
	"home_project_count" integer DEFAULT 4 NOT NULL,
	"socials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"support" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"number" text DEFAULT '01' NOT NULL,
	"group" text NOT NULL,
	"items" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
