# Readme

# Sentinel — AI Financial Analyst

**Live demo:** [https://sentinel-sentry.vercel.app/](<https://sentinel-sentry.vercel.app/>)

Frontend : https://github.com/devinfebrian/sentinel
Backend : https://github.com/vhysxl/sentinel-backend
Agent-server: https://github.com/vhysxl/sentinel-agent-server

Account Admin: 
`Email : admin@sentinel.com`

`Password: Admin123!`

Sentinel is a proactive AI financial-audit platform. Deterministic Python detectors flag

anomalies in every transaction; a 3-agent Gemini pipeline investigates only the real

candidates and writes evidence-backed **Findings**; finance staff review/resolve them on a

dashboard or ask questions in plain language via **Ask Sentinel**.

---

## Architecture

Three services, one shared PostgreSQL database (Neon). Only `sentinel-backend` is

browser-facing; only it can reach `sentinel-agent-server` (shared-secret header, no other

auth — must stay network-private).

```mermaid
flowchart LR
    User(["Finance Staff / Lead"]) --> FE["sentinel\nNext.js — :3000"]
    FE -- "/api/v1/*" --> BE["sentinel-backend\nExpress — :5000\nauth · users · transactions · vendors"]
    BE -- "X-Internal-Key" --> AG["sentinel-agent-server\nFastAPI — :8000\ndetectors · scoring · 3-agent AI · Ask Sentinel"]
    BE --> DB[("PostgreSQL — Neon")]
    AG --> DB
    AG -- "google-genai SDK" --> GEMINI[["Google Gemini"]]
```

**Data ownership** (same DB, split by table): `sentinel-backend` owns `users`, `vendors`,

`transactions`. `sentinel-agent-server` owns `findings`, `transaction_analysis`,

`backfill_lock`, `ask_history`.

---

## Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : "input_by_user_id"
    USERS ||--o{ FINDINGS : "resolved_by"
    VENDORS ||--o{ TRANSACTIONS : "vendor_id"
    TRANSACTIONS ||--o| FINDINGS : "transaction_id (unique)"
    TRANSACTIONS ||--o| TRANSACTION_ANALYSIS : "transaction_id (PK=FK)"
    USERS {
        serial id PK
        varchar_255 email UK
        varchar_100 fullname
        varchar_255 password_hash "nullable — NULL means Google-only account"
        varchar_255 google_sub UK "nullable"
        boolean is_admin "only privilege flag in the system — Finance Lead"
        boolean must_change_password
        boolean is_active "deactivated, never hard-deleted"
        timestamptz last_login_at "nullable"
        timestamptz created_at
        timestamptz updated_at "nullable"
    }
    VENDORS {
        serial id PK
        varchar_100 vendor_name
        varchar_50 bank_account
        timestamp join_date "naive, no timezone"
        varchar_20 status "active | inactive — no other levels"
    }
    TRANSACTIONS {
        serial id PK
        timestamptz created_at "sole timestamp; from bank API, never user-typed"
        decimal_15_2 amount
        varchar_10 type "income | expense"
        varchar_50 category "app-level enum, not a DB constraint"
        text description "nullable"
        varchar_50 invoice_no "nullable, no unique constraint, NOT settable via the transaction-create API — see Limitations"
        integer vendor_id FK "nullable, -> vendors.id"
        integer input_by_user_id FK "nullable, -> users.id"
    }
    FINDINGS {
        serial id PK "owned by sentinel-agent-server"
        integer transaction_id FK "unique -> transactions.id, one finding per txn forever"
        int_array related_transaction_ids "all txns covered by this finding, incl. anchor"
        integer risk_score "0-100, final score"
        varchar_10 risk_level "low | medium | high | critical"
        text description "LLM headline, human-readable first line"
        jsonb evidence "Python: triggers, median/MAD, thresholds, base score — not nullable"
        jsonb analysis "LLM: 3-agent verdicts + narrative + adjustment — nullable if LLM failed"
        varchar_20 resolution "nullable = unresolved; justified|false_positive|confirmed_fraud|escalated"
        text resolution_note "required when resolving"
        integer resolved_by FK "nullable -> users.id"
        timestamptz resolved_at "nullable"
        timestamptz created_at
        timestamptz updated_at "nullable — set when group grows & rescored without LLM"
    }
    TRANSACTION_ANALYSIS {
        integer transaction_id "PK, FK -> transactions.id"
        timestamptz analyzed_at
        varchar_12 status "clean | flagged | failed"
        text error "nullable"
    }
    BACKFILL_LOCK {
        integer id PK "single row, id = 1"
        text owner
        timestamptz locked_at
        timestamptz heartbeat_at "stale lock is reclaimable after STALE_AFTER_SECONDS"
    }
    ASK_HISTORY {
        serial id PK
        text question
        text answer
        varchar_100 data_range "nullable"
        jsonb figures "nullable — Python-assembled list of legitimate figures"
        jsonb tools_used "nullable"
        jsonb steps "nullable"
        jsonb unsourced_figures "nullable — hallucination-guard output"
        text warning "nullable"
        timestamptz created_at
    }
```

One shared Postgres DB — `findings`/`transaction_analysis`/`backfill_lock`/`ask_history` are

owned and written only by `sentinel-agent-server`; everything else by `sentinel-backend`.

---

## Tech Stack

| Service | Language | Framework | Data / Auth | AI |
| -- | -- | -- | -- | -- |
| `sentinel` | TypeScript | Next.js 16 (App Router), React 19, Tailwind v4, Zustand | JWT (localStorage) + optional Google Sign-In | — |
| `sentinel-backend` | Node.js | Express 4, Drizzle ORM | PostgreSQL (Neon), JWT + Google Sign-In | — |
| `sentinel-agent-server` | Python | FastAPI, SQLAlchemy | Same PostgreSQL; internal shared-secret only | Google Gemini (`google-genai` SDK) |

All three deploy on **Vercel**.

---

## Core Features

* **7 deterministic fraud detectors** (pure Python, no AI): amount anomaly (modified z-score

  vs. vendor/category baseline), duplicate invoice, split payment, smurfing, vendor risk

  (inactive/new), vendor backdated, off-hours timing.
* **Two-layer scoring**: base score from detector points (Python, capped at 80) + AI semantic

  adjustment (±20, one agent only) → final 0–100, mapped to Low / Medium / High / Critical.
* **3-agent AI investigation** (Gemini): Agent 1 (financial) + Agent 2 (fraud) investigate a

  candidate in parallel, Agent 3 verifies both and may nudge the score. The AI never computes

  or overrides a number — it only narrates and verifies.
* **Ask Sentinel** — natural-language Q&A over company data (plan → execute → narrate), with a

  post-answer figure-audit step that flags any number the model couldn't trace back to real

  query output.
* **Findings dashboard** — live analysis console, filter/search, resolve with a mandatory

  reason.
* **Transactions & vendors** — CRUD, vendor management, spreadsheet import UI (backend endpoint

  currently missing — see Limitations).
* **Admin** — user creation/deactivation (single `is_admin` flag; see Limitations).

---

## How to Run

All three services must run together — `sentinel` needs `sentinel-backend`, and

`sentinel-backend` needs `sentinel-agent-server`. `AGENT_SERVER_KEY` (backend) must exactly

match `INTERNAL_API_KEY` (agent server).

`sentinel-agent-server` (start first — owns the shared DB migrations)

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # set DATABASE_URL, INTERNAL_API_KEY, GEMINI_API_KEY
python migrate.py
uvicorn app.main:app --reload --port 8000
```

`sentinel-backend`

```bash
npm install
cp .env.example .env        # set DATABASE_URL, JWT_SECRET(s), AGENT_SERVER_URL/KEY
npm run db:migrate
npm run db:seed             # optional — creates the first Finance Lead account
npm run dev                 # http://localhost:5000
```

`sentinel` (frontend)

```bash
npm install
cp .env.example .env.local  # set BACKEND_URL (defaults to http://127.0.0.1:5000)
npm run dev                 # http://localhost:3000
```

Or just use the live deployment: [**https://sentinel-sentry.vercel.app/**](<https://sentinel-sentry.vercel.app/>)

---

## Limitations (~50% implementation status)

The detection algorithms genuinely work — all 7 detectors, the scoring engine, the 3-agent

pipeline, and Ask Sentinel all run correctly against real data. What's not production-ready is

the business infrastructure around them:

* Split-payment detection for the same invoice may not work if the system enforces a unique constraint on transactions table.
* **Bulk transaction import is currently broken end-to-end.** The frontend's import flow calls

  `POST /transactions/import`, which parses `invoice_no` from the spreadsheet — but that route

  doesn't exist on `sentinel-backend` (`transaction.routes.js` only has `POST /`, `GET /`,

  `GET /categories`, `GET /:id`, `PUT /:id`). Every import attempt fails.
* **The Rp25,000,000 split-payment threshold is fictional.** The app has no real

  budget/finance-threshold configuration anywhere — it's a hardcoded placeholder, not a

  company policy value.
* **No RBAC beyond a single** `is_admin` **flag**, and no tiered approval workflow — Finance Staff

  and Finance Lead have identical data access.
* **Auth enforcement is client-side only** — no Next.js `middleware.ts`; session lives in

  `localStorage`.
* **The agent server has no authentication of its own** beyond a shared-secret header —

  it must never be exposed directly to the internet.
