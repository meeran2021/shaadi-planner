# Shaadi Planner

AI-powered wedding budget planner for Indian couples. Answer a 4-step intake form, get a personalised vendor budget breakdown from an AI, track payments against it, and ask follow-up questions — all in one session.

**Live demo:** _[add Vercel URL here]_

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | Mantine v7 + Tabler Icons |
| AI | Google Gemini 2.5 Flash |
| Database | Supabase (Postgres) |
| Validation | Zod (server + client) |
| State / fetching | TanStack Query v5 |

---

## Features

- **4-step intake wizard** — wedding date, venue, budget bracket, top 2 priorities
- **AI recommendation engine** — 8 vendor categories with INR allocations calibrated to city and guest count, streamed in real time
- **Budget tracker** — log payments per category, progress bars with overspend warnings
- **Follow-up chat** — AI assistant with full plan context (allocations + live spend data)
- **Plan history** — plans saved by URL; revisit any past plan without re-running the AI
- **Custom categories** — add categories beyond the AI-generated 8

---

## Local Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com/apikey) API key

### Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd shaadi-planner

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in the three values (see below)

# 4. Apply database migrations
npx supabase link --project-ref <your-project-ref>
npx supabase db push

# 5. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `GOOGLE_AI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → `service_role` key |

> `SUPABASE_SERVICE_ROLE_KEY` is used server-side only (never exposed to the client). Keep it out of version control.

---

## Database

Migrations live in `supabase/migrations/`. Two files:

| File | Description |
|---|---|
| `20260531000000_initial_schema.sql` | Creates `intake_forms`, `recommendations`, `payments` tables with indexes and FK constraints |
| `20260531000001_nullable_priority_rank.sql` | Allows `priority_rank` to be null for user-added custom categories |

To apply to a fresh Supabase project:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

---

## Design Decisions

### Structured output via `responseSchema`
Rather than prompting for JSON and parsing the response (fragile), the Gemini SDK's `responseSchema` option enforces the exact output shape at the model level. A Zod layer then validates semantics (allocations sum to ~100%, priority categories ranked 1–2). This eliminates JSON parse failures entirely.

### `enforcePriorityRanks` post-processing
Even with explicit prompting, LLMs occasionally assign priority ranks inconsistently. A deterministic post-processing step overwrites ranks after the model responds, guaranteeing the couple's two picks are always ranked 1 and 2 regardless of what the model returned.

### SSE streaming with status messages
The recommendation call takes 5–8 seconds. Rather than showing a spinner, the server drips status messages ("Researching vendor costs in Mumbai…") over Server-Sent Events while the AI call runs in the background. Perceived wait time drops significantly.

### Rollback on partial failure
If the recommendations DB insert fails after the intake form has been saved, the orphan `intake_forms` row is deleted before returning an error. The client never receives a `planId` that leads to a broken plan page.

### No authentication
Plans are accessed by UUID in the URL. There is no login. Plan IDs are saved to `localStorage` so users can navigate back to their plans. This is a deliberate v1 simplification — the PRD explicitly marks auth as out of scope.

### Chat context includes live spend data
The chat system prompt is built fresh on every request and includes each category's suggested range, amount spent so far, and remaining balance. This allows the AI to answer questions like "am I over budget on catering?" with the actual figures rather than a generic estimate.

### `totalAllocated` intentionally omitted from budget summary
The sum of `suggested_max` values across all categories can exceed the total budget (the AI allocates ranges, not exact sums). Showing a misleading "Allocated: ₹X" figure where X > total budget would confuse users. The budget summary shows Total Budget, Spent, and Balance — the only three numbers that matter for decision-making.
