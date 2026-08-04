# Sentinel Financial Intelligence — Refactor Design

**Date:** 2026-08-04
**Status:** Approved (design reviewed with user)

## Goal

Refactor two codebases so that everything shares one design system, and ship the
product as **Sentinel** (a financial intelligence / AI risk analysis platform):

1. **Lumina mockups** — `C:\Users\User\Documents\KADA\stitch_lumina_financial_intelligence\stitch_lumina_financial_intelligence`
2. **Sentinel Next.js app** — the current working directory

The reference design is the `overview_dashboard_light` mockup. Every other mockup
and every Sentinel page is restyled to match it. Sentinel's content focus is
**financial intelligence**, not the current education (Eleva) content.

## Scope

- **All 9 Lumina mockups** restyled in place to the canonical design system.
- **Sentinel Next.js app** rebuilt as a full app shell: working auth
  (login / change-password), a dashboard home page, and one page per Lumina
  screen so navigation works end-to-end.
- App name changed from "Eleva" to **Sentinel**.

## Design System (Canonical — from `overview_dashboard_light`)

### Colors

| Token | Value |
|---|---|
| `primary` | `#EDFF8C` (lime) |
| `on-primary` | `#191c1e` |
| `primary-container` | `#EDFF8C` |
| `on-primary-container` | `#191c1e` |
| `background` / `surface` | `#f7f9ff` |
| `surface-container-lowest` | `#ffffff` |
| `surface-container-low` | `#f2f4f7` |
| `surface-container` | `#eceef1` |
| `surface-container-high` | `#e6e8eb` |
| `surface-container-highest` | `#e0e3e6` |
| `on-surface` | `#191c1e` |
| `on-surface-variant` | `#434652` |
| `outline` | `#747783` |
| `outline-variant` | `#c4c6d3` |
| `secondary` | `#0058be` |
| `error` | `#ba1a1a` |
| `error-container` | `#ffdad6` |
| `on-error-container` | `#93000a` |
| AI accent | `#93A144` |

### Typography (Urbanist)

| Role | Size / Weight / Line-height |
|---|---|
| `display-lg` | 48px / 700 / 1.2, `-0.02em` |
| `headline-lg` | 32px / 700 / 1.25, `-0.01em` |
| `headline-md` | 24px / 700 / 1.3 |
| `headline-sm` | 20px / 700 / 1.4 |
| `body-lg` | 18px / 500 / 1.6 |
| `body-md` | 16px / 500 / 1.5 |
| `body-sm` | 14px / 500 / 1.5 |
| `label-md` | 14px / 700 / 1, `0.01em` |
| `label-sm` | 12px / 600 / 1 |

### Shape & Elevation

- Radius: `0.5rem` default, `0.75rem` (xl) for cards, `full` for pills.
- Cards: white (`surface-container-lowest`), shadow `0px 4px 20px rgba(0,0,0,0.04)`,
  `rounded-xl`, `p-padding-card` (24px).
- AI panels: `border-l-2` lime `#EDFF8C`, `ai-wash` background
  (`rgba(237,255,140,0.15)`), optional "AI Verified" pill.
- Primary buttons: `bg-primary text-on-primary rounded-lg shadow-sm`.
- Secondary buttons: white bg, `border border-outline-variant rounded-lg shadow-sm`.
- Status chips: pill, tinted backgrounds (e.g., error chips `bg-[#ffdad6] text-[#93000a]`).

### Layout

- Slim **88px icon sidebar** (Material Symbols), fixed left, active nav item is a
  lime `bg-primary` circle.
- Sticky **topbar**: search input (pill), primary nav links, "AI Assistant" action,
  notifications / hub / account icons.
- Main canvas: `max-w-[1440px]` centered, 32px page margins (`p-margin-page`),
  24px gutters (`gap-gutter-grid`).
- Bento grid: 12 columns on desktop, stacked on mobile.

## Deliverables

### A. Lumina mockups (9 screens)

Each `code.html` keeps its unique content and is restyled with the canonical token
set (tailwind config), slim sidebar, topbar, cards, chips, and buttons. Screens:

1. `overview_dashboard_light` — reference, already conformant (verify only).
2. `transactions_light`
3. `investigation_queue_kinetic_light`
4. `ai_configuration_kinetic_light`
5. `financial_insights_kinetic_light`
6. `executive_reports_kinetic_light`
7. `tool_catalog_kinetic_light`
8. `user_management_kinetic_light`
9. `vendors_kinetic_light`

### B. Sentinel Next.js app

- **Branding**: app name + metadata + login header + favicon → **Sentinel**.
- **`app/globals.css`**: replace old Academic-Excellence palette with the canonical
  tokens (Tailwind v4 `@theme`), font → Urbanist.
- **Shared shell**: `components/layout/Sidebar.jsx` (88px icon nav routing to all
  pages) and `components/layout/TopBar.jsx` (search + nav + AI Assistant + account).
- **Pages** (one per screen):
  - `/` — dashboard (matches `overview_dashboard_light`)
  - `/transactions` — financial operations table
  - `/investigation-queue` — investigation board
  - `/ai-configuration` — AI models config
  - `/financial-insights` — insights
  - `/executive-reports` — reports
  - `/tool-catalog` — tool catalog
  - `/user-management` — user management
  - `/vendors` — vendor risk directory
- **Auth preserved**: `/login` and `/change-password` re-skinned with the new design.
  `context/AuthContext.tsx` and `lib/services/api.js` remain functional/unchanged in
  behavior. Home redirect logic stays.
- **Navigation**: sidebar items link to all pages. Each non-dashboard page renders
  a full static screen (not a stub) with the same title, hero, and primary
  content/cards as its mockup counterpart, using mock data.

## Error Handling & States

- Reuse existing `AlertNotice`/`InputField`/`PrimaryButton` components where
  applicable, restyled to the new tokens.
- Loading state on home (auth check) keeps the new color tokens.
- No new data fetching or backend changes; pages render mock content matching the
  mockups.

## Testing

- `npm run lint` and `npm run build` pass in the Sentinel app.
- Each Lumina `code.html` and each Sentinel page renders with the reference design
  vocabulary (sidebar, topbar, cards, lime primary).

## Out of Scope

- No backend / API changes.
- No real financial data ingestion.
- No dark-mode implementation (reference mockup is light only).
