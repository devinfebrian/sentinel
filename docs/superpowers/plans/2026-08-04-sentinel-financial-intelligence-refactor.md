# Sentinel Financial Intelligence — Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle all 9 Lumina mockups and rebuild the Sentinel Next.js app so every screen shares one design system (from `overview_dashboard_light`), branded **Sentinel** with a working full app shell.

**Architecture:** The canonical design system lives in `overview_dashboard_light/code.html`. Part A restyles each Lumina mockup in place (same tokens/sidebar/topbar/cards, unique content preserved). Part B rebuilds the Sentinel app: new design tokens in `globals.css`, shared `Sidebar`/`TopBar`/`DashboardShell` layout, 9 routes (`/`, `/transactions`, `/investigation-queue`, `/ai-configuration`, `/financial-insights`, `/executive-reports`, `/tool-catalog`, `/user-management`, `/vendors`), and re-skinned auth (login/change-password). Auth logic, `context/AuthContext.tsx`, and `lib/services/api.js` behavior are preserved.

**Tech Stack:** Tailwind CSS v4 (`@theme` in `globals.css`), Next.js 16 App Router, `next/font/google` (Urbanist variable font), Material Symbols icons, React 19. The Lumina mockups use the Tailwind CDN + inline `tailwind.config`.

## Global Constraints

- **Reference design:** `overview_dashboard_light/code.html` (canonical).
- **Canonical tokens (from reference):**
  - `primary` = `#EDFF8C`; `on-primary` = `#191c1e`; `primary-container` = `#EDFF8C`; `on-primary-container` = `#191c1e`
  - `background`/`surface` = `#f7f9ff`; `surface-container-lowest` = `#ffffff`
  - `surface-container-low` = `#f2f4f7`; `surface-container` = `#eceef1`
  - `surface-container-high` = `#e6e8eb`; `surface-container-highest` = `#e0e3e6`
  - `on-surface` = `#191c1e`; `on-surface-variant` = `#434652`
  - `outline` = `#747783`; `outline-variant` = `#c4c6d3`
  - `secondary` = `#0058be`; `error` = `#ba1a1a`; `error-container` = `#ffdad6`; `on-error-container` = `#93000a`
  - AI accent = `#93A144`; AI wash = `rgba(237,255,140,0.15)`
- **Canonical typography (Urbanist):** display-lg 48/700/1.2/-0.02em; headline-lg 32/700/1.25/-0.01em; headline-md 24/700/1.3; headline-sm 20/700/1.4; body-lg 18/500/1.6; body-md 16/500/1.5; body-sm 14/500/1.5; label-md 14/700/1/0.01em; label-sm 12/600/1.
- **Canonical radius:** DEFAULT `0.5rem`; xl `0.75rem`; full `9999px`.
- **Card:** `bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card` (24px padding).
- **Primary button:** `bg-primary text-on-primary rounded-lg ... shadow-sm`.
- **Secondary button:** `bg-white border border-outline-variant rounded-lg ... shadow-sm`.
- **Slim sidebar:** 88px fixed-left icon nav (Material Symbols); active item `bg-primary text-on-primary`.
- **App name is "Sentinel"** everywhere in the Sentinel app. Brand in mockups stays "FinAnalysis AI".
- **No comments in code.** No new dependencies.
- **Sentinel verification:** `npm run lint` and `npm run build` must pass.
- **Mockup verification:** file must contain the canonical tokens + canonical sidebar/topbar; open in browser.

---

## Part A — Lumina Mockups

> **Note:** `C:\Users\User\Documents\KADA\stitch_lumina_financial_intelligence` is **not a git repository**. The commit steps in Part A tasks are OPTIONAL — skip them unless the executor first runs `git init` in that folder (not recommended; the folder is a design-asset store, not a repo). All Sentinel-side commits in Part B apply to the Sentinel repo.

The canonical config block, style block, sidebar, and topbar are defined once in Task 1. Later tasks reuse them verbatim.

### Task 1: Canonical block definition + overview verification

**Files:**
- Reference: `stitch_lumina_financial_intelligence/stitch_lumina_financial_intelligence/overview_dashboard_light/code.html`

**Interfaces:**
- Produces: The canonical `tailwind-config` script (colors, borderRadius, spacing, fontFamily, fontSize), canonical `<style>` block, canonical `<nav>` sidebar, and canonical `<header>` topbar that all other mockup tasks copy verbatim from this task's code blocks.

- [ ] **Step 1: Record the canonical tailwind-config block**

This exact block (taken from `overview_dashboard_light/code.html` lines 12–181) is THE canonical config. Every mockup task replaces its `<script id="tailwind-config">…</script>` contents with this:

```html
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-secondary-container": "#191c1e",
                    "on-tertiary-fixed": "#00201c",
                    "surface-tint": "#EDFF8C",
                    "on-surface": "#191c1e",
                    "on-background": "#191c1e",
                    "tertiary-fixed-dim": "#4fdbc8",
                    "inverse-on-surface": "#eff1f4",
                    "on-tertiary-fixed-variant": "#005048",
                    "on-error-container": "#93000a",
                    "surface-container-lowest": "#ffffff",
                    "secondary": "#0058be",
                    "surface-bright": "#f7f9fc",
                    "secondary-fixed-dim": "#adc6ff",
                    "secondary-container": "#2170e4",
                    "surface-container": "#eceef1",
                    "surface-container-low": "#f2f4f7",
                    "tertiary": "#00322d",
                    "tertiary-fixed": "#71f8e4",
                    "error": "#ba1a1a",
                    "surface-dim": "#d8dadd",
                    "outline-variant": "#c4c6d3",
                    "primary-fixed": "#EDFF8C",
                    "on-primary": "#191c1e",
                    "secondary-fixed": "#d8e2ff",
                    "primary-fixed-dim": "#EDFF8C",
                    "on-secondary": "#ffffff",
                    "inverse-primary": "#b2c5ff",
                    "on-tertiary": "#ffffff",
                    "on-primary-fixed": "#191c1e",
                    "surface-container-highest": "#e0e3e6",
                    "tertiary-container": "#004b43",
                    "surface-container-high": "#e6e8eb",
                    "primary": "#EDFF8C",
                    "on-error": "#ffffff",
                    "surface-variant": "#e0e3e6",
                    "on-tertiary-container": "#2cc3b0",
                    "background": "#f7f9ff",
                    "on-secondary-fixed-variant": "#004395",
                    "on-primary-container": "#191c1e",
                    "inverse-surface": "#2d3133",
                    "surface": "#f7f9ff",
                    "primary-container": "#EDFF8C",
                    "error-container": "#ffdad6",
                    "outline": "#747783",
                    "on-primary-fixed-variant": "#191c1e",
                    "on-surface-variant": "#434652",
                    "on-secondary-fixed": "#001a42"
            },
            "borderRadius": {
                    "DEFAULT": "0.5rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "padding-card": "24px",
                    "stack-md": "24px",
                    "gutter-grid": "24px",
                    "base": "8px",
                    "stack-lg": "48px",
                    "margin-page": "32px",
                    "stack-sm": "12px"
            },
            "fontFamily": {
                    "body-sm": ["Urbanist", "sans-serif"],
                    "headline-lg": ["Urbanist", "sans-serif"],
                    "body-lg": ["Urbanist", "sans-serif"],
                    "label-sm": ["Urbanist", "sans-serif"],
                    "label-md": ["Urbanist", "sans-serif"],
                    "display-lg": ["Urbanist", "sans-serif"],
                    "headline-sm": ["Urbanist", "sans-serif"],
                    "body-md": ["Urbanist", "sans-serif"],
                    "headline-md": ["Urbanist", "sans-serif"]
            },
            "fontSize": {
                    "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "500" }],
                    "headline-lg": ["32px", { "lineHeight": "1.25", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                    "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "500" }],
                    "label-sm": ["12px", { "lineHeight": "1", "fontWeight": "600" }],
                    "label-md": ["14px", { "lineHeight": "1", "letterSpacing": "0.01em", "fontWeight": "700" }],
                    "display-lg": ["48px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                    "headline-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "700" }],
                    "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "500" }],
                    "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "700" }]
            }
    },
        },
      }
    </script>
```

- [ ] **Step 2: Record the canonical style block**

Every mockup task replaces its `<style>` block with this:

```html
<style>
        .material-symbols-outlined {
            font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24
        }
        .ai-gradient-text {
            background: linear-gradient(90deg, #93A144, #191c1e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .ai-wash {
            background-color: rgba(237, 255, 140, 0.15);
        }
    </style>
```

- [ ] **Step 3: Record the canonical sidebar `<nav>`**

Every mockup task replaces its sidebar with this:

```html
<!-- Slim SideNavBar -->
<nav class="w-[88px] h-full fixed left-0 top-0 bg-surface-container-lowest flex flex-col items-center py-6 z-50 shadow-sm border-r border-outline-variant/30">
<div class="bg-surface-container-low rounded-full p-1 flex flex-col gap-1 mb-8">
<button class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors bg-white shadow-sm">
<span class="material-symbols-outlined text-[20px]">light_mode</span>
</button>
<button class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
<span class="material-symbols-outlined text-[20px]">dark_mode</span>
</button>
</div>
<div class="flex flex-col gap-4 flex-1 w-full px-4 items-center">
<a class="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-on-primary transition-colors" href="#" title="Overview">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
</a>
<a class="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors" href="#" title="Calendar">
<span class="material-symbols-outlined">calendar_today</span>
</a>
<a class="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors" href="#" title="Mail">
<span class="material-symbols-outlined">mail</span>
</a>
<a class="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors" href="#" title="Documents">
<span class="material-symbols-outlined">description</span>
</a>
<a class="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors" href="#" title="Community">
<span class="material-symbols-outlined">group</span>
</a>
<a class="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors" href="#" title="Layers">
<span class="material-symbols-outlined">layers</span>
</a>
<a class="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors" href="#" title="Settings">
<span class="material-symbols-outlined">settings</span>
</a>
</div>
<div class="mt-auto flex flex-col gap-4 w-full px-4 items-center">
<button class="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors" title="Help">
<span class="material-symbols-outlined">help</span>
</button>
<button class="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors" title="Logout">
<span class="material-symbols-outlined">logout</span>
</button>
</div>
</nav>
```

- [ ] **Step 4: Record the canonical topbar `<header>`**

Every mockup task replaces its topbar with this (change `placeholder` and active nav link per screen):

```html
<!-- TopAppBar -->
<header class="flex justify-between items-center w-full px-margin-page h-16 max-w-[1180px] mx-auto bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
<div class="flex items-center gap-6">
<div class="relative w-64 hidden lg:block">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input class="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full font-body-sm text-body-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Search insights..." type="text"/>
</div>
<nav class="hidden md:flex gap-6">
<a class="font-label-md text-label-md text-on-surface border-b-2 border-primary pb-1" href="#">Global View</a>
<a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-all" href="#">Market Trends</a>
</nav>
</div>
<div class="flex items-center gap-4">
<button class="flex items-center gap-2 text-on-surface font-label-md text-label-md hover:opacity-80 transition-opacity">
<span class="material-symbols-outlined text-primary">smart_toy</span>
                    AI Assistant
                </button>
<div class="flex items-center gap-2 border-l border-outline-variant pl-4">
<button class="text-on-surface-variant hover:text-on-surface transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-on-surface transition-colors">
<span class="material-symbols-outlined">hub</span>
</button>
<button class="text-on-surface-variant hover:text-on-surface transition-colors">
<span class="material-symbols-outlined">account_circle</span>
</button>
</div>
</div>
</header>
```

- [ ] **Step 5: Verify the reference file already conforms**

Run: `grep -c "bg-primary text-on-primary" "overview_dashboard_light/code.html"`
Expected: matches >= 1 (reference sidebar active state present).

- [ ] **Step 6: (Optional) Commit — only if this folder is under git**

This folder is not a git repo; skip unless initialized:

```bash
git add -A && git commit -m "chore: capture canonical design block from overview_dashboard_light"
```

---

### Task 2: Restyle transactions_light

**Files:**
- Modify: `stitch_lumina_financial_intelligence/stitch_lumina_financial_intelligence/transactions_light/code.html`

**Interfaces:**
- Consumes: Canonical config/style/sidebar/topbar blocks from Task 1.
- Produces: A fully canonical-styled Transactions screen preserving content (Financial Operations header, filter bar, transactions table with AI risk chips, pagination).

- [ ] **Step 1: Replace the tailwind-config script**

Replace the entire `<script id="tailwind-config">…</script>` element with the canonical config from Task 1 Step 1.

- [ ] **Step 2: Replace the `<style>` block**

Replace the style block with the canonical style block from Task 1 Step 2. Ensure `Urbanist` is loaded in the fonts `<link>` (the file already loads Urbanist).

- [ ] **Step 3: Replace the sidebar**

Replace the existing `<nav>…</nav>` sidebar with the canonical sidebar from Task 1 Step 3 (all `href="#"`).

- [ ] **Step 4: Add a canonical topbar**

Insert the canonical topbar header from Task 1 Step 4 directly before `<main>`, placeholder `"Search transactions..."`. Keep `<main class="ml-[88px] p-margin-page max-w-[1440px] mx-auto w-full">` (drop any `relative`/`max-w-[calc...]`).

- [ ] **Step 5: Normalize content classes**

Apply these replacements throughout the page content:
- `rounded-lg` on cards → `rounded-xl`
- Card `bg-surface-container-lowest` + any shadow → canonical card shadow `shadow-[0px_4px_20px_rgba(0,0,0,0.04)]`
- Secondary buttons → `bg-white border border-outline-variant ... rounded-lg ... shadow-sm`
- Primary buttons → `bg-primary text-on-primary ... rounded-lg ... shadow-sm`
- Filter bar → `bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card`
- Table header bg `bg-surface-bright` → `bg-surface-container-low`
- Keep all text content, table rows, AI risk chips (`bg-error-container text-on-error-container` / `ai-wash`), and the drawer markup.

- [ ] **Step 6: Verify**

Run: `grep -c "bg-primary text-on-primary" "transactions_light/code.html"`
Run: `grep -c "shadow-\[0px_4px_20px_rgba(0,0,0,0.04)\]" "transactions_light/code.html"`
Expected: both >= 1. Then open the file in a browser to confirm it matches the reference layout.

- [ ] **Step 7: (Optional) Commit — only if folder is under git** — `git add -A && git commit -m "feat: restyle transactions_light to canonical design"`

---

### Task 3: Restyle investigation_queue_kinetic_light

**Files:**
- Modify: `stitch_lumina_financial_intelligence/stitch_lumina_financial_intelligence/investigation_queue_kinetic_light/code.html`

**Interfaces:**
- Consumes: Canonical blocks from Task 1.
- Produces: Canonical-styled Investigation Board (kanban columns Pending / In Progress / Review, case cards, header with Filter + New Case).

- [ ] **Step 1: Replace the tailwind-config script** with canonical config (Task 1 Step 1).
- [ ] **Step 2: Replace the `<style>` block** with canonical style block (Task 1 Step 2). Keep any `.hide-scrollbar`/`.kanban-scroll` rules already present.
- [ ] **Step 3: Replace the sidebar `<nav>`** with the canonical sidebar (Task 1 Step 3).
- [ ] **Step 4: Replace the topbar `<header>`** with the canonical topbar (Task 1 Step 4), placeholder `"Search cases..."`, active link `Global View`.
- [ ] **Step 5: Normalize content classes** per Task 2 Step 5 mapping. Keep the kanban columns, case cards (with left color bars `bg-error`/`bg-tertiary`), priority chips, avatars, and "New Case" primary button (`bg-primary text-on-primary rounded-lg shadow-sm`).
- [ ] **Step 6: Verify** — `grep -c "bg-primary text-on-primary"` and `grep -c "shadow-\[0px_4px_20px_rgba(0,0,0,0.04)\]"` both >= 1; open in browser.
- [ ] **Step 7: (Optional) Commit — only if folder is under git** — `git add -A && git commit -m "feat: restyle investigation_queue_kinetic_light to canonical design"`

---

### Task 4: Restyle ai_configuration_kinetic_light

**Files:**
- Modify: `stitch_lumina_financial_intelligence/stitch_lumina_financial_intelligence/ai_configuration_kinetic_light/code.html`

**Interfaces:**
- Consumes: Canonical blocks from Task 1.
- Produces: Canonical-styled AI Configuration (page header, Global Risk Parameters sliders + toggle switches, Active Intelligence Models cards).

- [ ] **Step 1: Replace the tailwind-config script** with canonical config (Task 1 Step 1).
- [ ] **Step 2: Replace the `<style>` block** with canonical style block (Task 1 Step 2).
- [ ] **Step 3: Replace the sidebar `<nav>`** with the canonical sidebar (Task 1 Step 3).
- [ ] **Step 4: Replace the topbar `<header>`** with the canonical topbar (Task 1 Step 4), placeholder `"Search parameters..."`, active link `Global View`. The header already shows an `analytics` brand chip — keep that brand chip inside the new topbar's left group.
- [ ] **Step 5: Normalize content classes** per Task 2 Step 5 mapping. Keep the sliders, toggle switches (`relative inline-block w-10` pattern), model cards, "Active" badges, and range inputs.
- [ ] **Step 6: Verify** — both greps >= 1; open in browser.
- [ ] **Step 7: (Optional) Commit — only if folder is under git** — `git add -A && git commit -m "feat: restyle ai_configuration_kinetic_light to canonical design"`

---

### Task 5: Restyle financial_insights_kinetic_light

**Files:**
- Modify: `stitch_lumina_financial_intelligence/stitch_lumina_financial_intelligence/financial_insights_kinetic_light/code.html`

**Interfaces:**
- Consumes: Canonical blocks from Task 1.
- Produces: Canonical-styled Financial Insights (page header + Actuals/AI Forecast toggle, Revenue Analytics chart card, AI Forecast panel).

- [ ] **Step 1: Replace the tailwind-config script** with canonical config (Task 1 Step 1).
- [ ] **Step 2: Replace the `<style>` block** with canonical style block (Task 1 Step 2).
- [ ] **Step 3: Replace the sidebar `<nav>`** with the canonical sidebar (Task 1 Step 3).
- [ ] **Step 4: Replace the topbar `<header>`** with the canonical topbar (Task 1 Step 4), placeholder `"Search financial data..."`, active link `Global View`.
- [ ] **Step 5: Normalize content classes** per Task 2 Step 5 mapping. Keep the Revenue Analytics chart (bar chart divs), gridlines, forecast panel, and the Actuals/AI Forecast segmented toggle (white active pill on `bg-surface-container-low`).
- [ ] **Step 6: Verify** — both greps >= 1; open in browser.
- [ ] **Step 7: (Optional) Commit — only if folder is under git** — `git add -A && git commit -m "feat: restyle financial_insights_kinetic_light to canonical design"`

---

### Task 6: Restyle executive_reports_kinetic_light

**Files:**
- Modify: `stitch_lumina_financial_intelligence/stitch_lumina_financial_intelligence/executive_reports_kinetic_light/code.html`

**Interfaces:**
- Consumes: Canonical blocks from Task 1.
- Produces: Canonical-styled Executive Reports (page header, report cards/summary, AI-generated report section).

- [ ] **Step 1: Replace the tailwind-config script** with canonical config (Task 1 Step 1).
- [ ] **Step 2: Replace the `<style>` block** with canonical style block (Task 1 Step 2).
- [ ] **Step 3: Replace the sidebar `<nav>`** with the canonical sidebar (Task 1 Step 3).
- [ ] **Step 4: Replace the topbar `<header>`** with the canonical topbar (Task 1 Step 4), placeholder `"Search reports..."`, active link `Global View`.
- [ ] **Step 5: Normalize content classes** per Task 2 Step 5 mapping. Keep the report cards, download/share buttons, and any AI insight panel with the lime left border.
- [ ] **Step 6: Verify** — both greps >= 1; open in browser.
- [ ] **Step 7: (Optional) Commit — only if folder is under git** — `git add -A && git commit -m "feat: restyle executive_reports_kinetic_light to canonical design"`

---

### Task 7: Restyle tool_catalog_kinetic_light

**Files:**
- Modify: `stitch_lumina_financial_intelligence/stitch_lumina_financial_intelligence/tool_catalog_kinetic_light/code.html`

**Interfaces:**
- Consumes: Canonical blocks from Task 1.
- Produces: Canonical-styled Tool Catalog (page header + "Connect New Tool" button, category tabs, tool integration cards).

- [ ] **Step 1: Replace the tailwind-config script** with canonical config (Task 1 Step 1).
- [ ] **Step 2: Replace the `<style>` block** with canonical style block (Task 1 Step 2).
- [ ] **Step 3: Replace the sidebar `<nav>`** with the canonical sidebar (Task 1 Step 3).
- [ ] **Step 4: Replace the topbar `<header>`** with the canonical topbar (Task 1 Step 4), placeholder `"Search tools..."`, active link `Global View`. Keep the existing `FA`/`FinAnalysis AI` brand chip in the topbar left group.
- [ ] **Step 5: Normalize content classes** per Task 2 Step 5 mapping. Keep the category tabs (active tab `text-primary border-b-2 border-primary`), tool cards with icon chips and "Connected"/status badges, and the "Connect New Tool" primary button (`bg-primary text-on-primary rounded-lg shadow-sm`).
- [ ] **Step 6: Verify** — both greps >= 1; open in browser.
- [ ] **Step 7: (Optional) Commit — only if folder is under git** — `git add -A && git commit -m "feat: restyle tool_catalog_kinetic_light to canonical design"`

---

### Task 8: Restyle user_management_kinetic_light

**Files:**
- Modify: `stitch_lumina_financial_intelligence/stitch_lumina_financial_intelligence/user_management_kinetic_light/code.html`

**Interfaces:**
- Consumes: Canonical blocks from Task 1.
- Produces: Canonical-styled User Management (page header + Audit Log/Invite User buttons, Active Directory users table).

- [ ] **Step 1: Replace the tailwind-config script** with canonical config (Task 1 Step 1).
- [ ] **Step 2: Replace the `<style>` block** with canonical style block (Task 1 Step 2).
- [ ] **Step 3: Replace the sidebar `<nav>`** with the canonical sidebar (Task 1 Step 3).
- [ ] **Step 4: Replace the topbar `<header>`** with the canonical topbar (Task 1 Step 4), placeholder `"Search users..."`, active link `Global View`.
- [ ] **Step 5: Normalize content classes** per Task 2 Step 5 mapping. Keep the Active Directory table (avatar initials, role chips, status chips, invite/audit buttons). Invite User → primary button; Audit Log → secondary button.
- [ ] **Step 6: Verify** — both greps >= 1; open in browser.
- [ ] **Step 7: (Optional) Commit — only if folder is under git** — `git add -A && git commit -m "feat: restyle user_management_kinetic_light to canonical design"`

---

### Task 9: Restyle vendors_kinetic_light

**Files:**
- Modify: `stitch_lumina_financial_intelligence/stitch_lumina_financial_intelligence/vendors_kinetic_light/code.html`

**Interfaces:**
- Consumes: Canonical blocks from Task 1.
- Produces: Canonical-styled Vendor Risk Directory (page header + Filter Risk button, vendor cards with risk badges, spend metrics, AI risk alerts).

- [ ] **Step 1: Replace the tailwind-config script** with canonical config (Task 1 Step 1).
- [ ] **Step 2: Replace the `<style>` block** with canonical style block (Task 1 Step 2).
- [ ] **Step 3: Replace the sidebar `<nav>`** with the canonical sidebar (Task 1 Step 3).
- [ ] **Step 4: Replace the topbar `<header>`** with the canonical topbar (Task 1 Step 4), placeholder `"Search vendors..."`, active link `Global View`.
- [ ] **Step 5: Normalize content classes** per Task 2 Step 5 mapping. Keep the vendor cards (`border-l-2 border-error` for high risk, `border-l-2 border-primary` for healthy), YTD spend / contracts / payment trend mini-stats, risk badges (`bg-error-container text-on-error-container`), and AI Risk Alert boxes (`bg-error-container/30 border-error/20`).
- [ ] **Step 6: Verify** — both greps >= 1; open in browser.
- [ ] **Step 7: (Optional) Commit — only if folder is under git** — `git add -A && git commit -m "feat: restyle vendors_kinetic_light to canonical design"`

---

## Part B — Sentinel Next.js App

### Task 10: Rebrand layout + design tokens

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `public/favicon.svg` (if present; else create `app/icon.svg`)

**Interfaces:**
- Produces: `--font-urbanist` CSS variable, canonical color tokens in Tailwind v4 `@theme`, body background `#f7f9ff`, metadata `title: "Sentinel"`, `description` for financial intelligence.

- [ ] **Step 1: Update `app/layout.tsx`**

Replace the whole file with:

```tsx
import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sentinel - Financial Intelligence",
  description: "Sentinel AI financial intelligence and risk analysis platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${urbanist.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f7f9ff] font-sans antialiased text-on-surface">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace `app/globals.css` tokens**

Replace the `@theme { … }` block in `app/globals.css` with canonical tokens:

```css
@theme {
  --color-primary: #EDFF8C;
  --color-on-primary: #191c1e;
  --color-primary-container: #EDFF8C;
  --color-on-primary-container: #191c1e;
  --color-primary-fixed: #EDFF8C;
  --color-primary-fixed-dim: #EDFF8C;
  --color-on-primary-fixed: #191c1e;
  --color-on-primary-fixed-variant: #191c1e;

  --color-secondary: #0058be;
  --color-secondary-container: #2170e4;
  --color-on-secondary: #ffffff;
  --color-on-secondary-container: #191c1e;
  --color-secondary-fixed: #d8e2ff;
  --color-secondary-fixed-dim: #adc6ff;
  --color-on-secondary-fixed: #001a42;
  --color-on-secondary-fixed-variant: #004395;

  --color-tertiary: #00322d;
  --color-tertiary-container: #004b43;
  --color-on-tertiary: #ffffff;
  --color-on-tertiary-container: #2cc3b0;
  --color-tertiary-fixed: #71f8e4;
  --color-tertiary-fixed-dim: #4fdbc8;
  --color-on-tertiary-fixed: #00201c;
  --color-on-tertiary-fixed-variant: #005048;

  --color-background: #f7f9ff;
  --color-on-background: #191c1e;
  --color-surface: #f7f9ff;
  --color-on-surface: #191c1e;
  --color-surface-variant: #e0e3e6;
  --color-on-surface-variant: #434652;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f2f4f7;
  --color-surface-container: #eceef1;
  --color-surface-container-high: #e6e8eb;
  --color-surface-container-highest: #e0e3e6;
  --color-surface-dim: #d8dadd;
  --color-surface-bright: #f7f9fc;
  --color-surface-tint: #EDFF8C;

  --color-outline: #747783;
  --color-outline-variant: #c4c6d3;
  --color-error: #ba1a1a;
  --color-error-container: #ffdad6;
  --color-on-error: #ffffff;
  --color-on-error-container: #93000a;

  --font-sans: var(--font-urbanist), system-ui, sans-serif;
  --font-urbanist: var(--font-urbanist), sans-serif;
}
```

Then:
- `:root` font-family → `var(--font-urbanist)`.
- `body { background-color: #f7f9ff; color: #191c1e; }`.
- Keep the custom spacing utility classes and `.material-symbols-outlined`, `.font-*`/`.text-*` utility classes, but change their font-family to `var(--font-urbanist)` and update weights to match canonical (`.font-headline-md` → 700, `.font-label-lg` → 700, `.font-label-sm` → 600, `.font-body-md` → 500). Keep `.ai-wash` and `.ai-gradient-text` utilities (add if missing).
- Remove `--color-custom-sky` if present; remove the old `#B9D9EB` background usages in this file.

- [ ] **Step 3: Update favicon / app icon**

If `public/favicon.svg` exists, keep it. Create `app/icon.svg` with a lime-on-dark "S" monogram (solid `#191c1e` background, `#EDFF8C` letter "S"). If SVG authoring is not feasible, reuse the existing favicon and skip — do not block the build.

- [ ] **Step 4: Verify**

Run: `npm run build` (from Sentinel root).
Expected: BUILD SUCCESS, metadata title is "Sentinel".

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css app/icon.svg
git commit -m "feat: rebrand to Sentinel and apply canonical design tokens"
```

---

### Task 11: Shared layout shell (Sidebar + TopBar + DashboardShell)

**Files:**
- Create: `components/layout/Sidebar.jsx`
- Create: `components/layout/TopBar.jsx`
- Create: `components/layout/DashboardShell.jsx`

**Interfaces:**
- Consumes: `useAuth` from `@/context/AuthContext`; Next `Link`/`usePathname`.
- Produces:
  - `Sidebar` — fixed 88px icon nav; item = `{ href, icon, title }`; active item styled `bg-primary text-on-primary`; logout button at bottom calling `logout()`.
  - `TopBar` — search input + Global View/Market Trends links + AI Assistant + notifications/hub/account icons; `placeholder` prop.
  - `DashboardShell({ title, subtitle, actions, children, placeholder })` — renders `Sidebar` + `TopBar` + `main`, and redirects to `/login` when `!isAuthenticated` (and `/change-password` when `mustChangePassword`).

- [ ] **Step 1: Create `components/layout/Sidebar.jsx`**

```jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/', icon: 'dashboard', title: 'Overview' },
  { href: '/transactions', icon: 'account_balance', title: 'Transactions' },
  { href: '/investigation-queue', icon: 'search_insights', title: 'Investigations' },
  { href: '/ai-configuration', icon: 'smart_toy', title: 'AI Configuration' },
  { href: '/financial-insights', icon: 'insights', title: 'Financial Insights' },
  { href: '/executive-reports', icon: 'description', title: 'Executive Reports' },
  { href: '/tool-catalog', icon: 'category', title: 'Tool Catalog' },
  { href: '/user-management', icon: 'group', title: 'User Management' },
  { href: '/vendors', icon: 'storefront', title: 'Vendors' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav className="w-[88px] h-full fixed left-0 top-0 bg-surface-container-lowest flex flex-col items-center py-6 z-50 shadow-sm border-r border-outline-variant/30">
      <div className="flex flex-col gap-4 flex-1 w-full px-4 items-center">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${
                active
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col gap-4 w-full px-4 items-center">
        <button
          type="button"
          title="Logout"
          onClick={logout}
          className="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create `components/layout/TopBar.jsx`**

```jsx
'use client';

import React from 'react';

export default function TopBar({ placeholder = 'Search insights...' }) {
  return (
    <header className="flex justify-between items-center w-full px-margin-page h-16 max-w-[1180px] mx-auto bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="relative w-64 hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full font-body-sm text-body-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder={placeholder}
            type="text"
          />
        </div>
        <nav className="hidden md:flex gap-6">
          <a className="font-label-md text-label-md text-on-surface border-b-2 border-primary pb-1" href="#">
            Global View
          </a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-all" href="#">
            Market Trends
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-on-surface font-label-md text-label-md hover:opacity-80 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
          AI Assistant
        </button>
        <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
          <button className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">hub</span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create `components/layout/DashboardShell.jsx`**

```jsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '@/context/AuthContext';

export default function DashboardShell({
  title,
  subtitle,
  actions,
  placeholder,
  children,
}) {
  const { isAuthenticated, mustChangePassword, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (mustChangePassword) {
        router.push('/change-password');
      }
    }
  }, [isAuthenticated, mustChangePassword, isLoading, router]);

  if (isLoading || !isAuthenticated || mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">
            progress_activity
          </span>
          <span className="font-label-lg text-primary font-bold">Authenticating...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md flex">
      <Sidebar />
      <div className="flex-1 ml-[88px] flex flex-col">
        <TopBar placeholder={placeholder} />
        <main className="flex-1 p-margin-page max-w-[1440px] mx-auto w-full">
          <div className="flex justify-between items-end mb-stack-md">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{title}</h1>
              {subtitle && (
                <p className="font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex gap-4">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/layout
git commit -m "feat: add shared sidebar, topbar, and dashboard shell"
```

---

### Task 12: Dashboard route (`/`)

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/home/HomePageClient.tsx` (replace content with dashboard)
- Create: `components/dashboard/OverviewDashboard.jsx`

**Interfaces:**
- Consumes: `DashboardShell` from Task 11.
- Produces: Route `/` rendering the `overview_dashboard_light` layout (hero header with Export Report / New Investigation buttons, AI Executive Summary panel with donut, 4 KPI cards with sparklines, Revenue Trend chart, AI Risk Center, Expense Breakdown donut).

- [ ] **Step 1: Create `components/dashboard/OverviewDashboard.jsx`**

Port the reference mockup's main content (lines 283–495 of `overview_dashboard_light/code.html`) into JSX, wrapped in `DashboardShell` with `title="Executive Overview"`, `subtitle="Real-time financial synthesis and AI risk analysis."`, and actions = the Export Report (secondary) + New Investigation (primary) buttons. Convert `svg` tags to JSX (self-close, camelCase attributes: `viewBox`, `preserveAspectRatio`, `strokeWidth`, `strokeDasharray`). Keep the lime donut, sparklines, revenue chart, risk center, expense breakdown, and "AI Verified" pill.

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
import OverviewDashboard from '@/components/dashboard/OverviewDashboard';

export default function HomePage() {
  return <OverviewDashboard />;
}
```

- [ ] **Step 3: Remove/replace `components/home/HomePageClient.tsx`**

Delete `components/home/HomePageClient.tsx` (the dashboard now handles auth gating via `DashboardShell`). If any import still references it, update it. `components/home/` may be removed entirely.

- [ ] **Step 4: Verify**

Run: `npm run lint` and `npm run build`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx components/dashboard
git rm -r components/home 2>/dev/null || true
git commit -m "feat: build dashboard home page from reference mockup"
```

---

### Task 13: Transactions route (`/transactions`)

**Files:**
- Create: `app/transactions/page.tsx`
- Create: `components/transactions/TransactionsPage.jsx`

**Interfaces:**
- Consumes: `DashboardShell`.
- Produces: Route `/transactions` — Financial Operations table (search + filter bar, table with checkbox/date/description/division/vendor/amount/status/AI risk, pagination).

- [ ] **Step 1: Create `components/transactions/TransactionsPage.jsx`**

Port `transactions_light` main content into JSX inside `DashboardShell` (`title="Financial Operations"`, subtitle `"Review and manage recent transactions with AI-assisted risk analysis."`, actions = Flag Selected + Export secondary buttons). Keep the filter bar, the table rows from the mockup (Cloud Server Expansion APAC / Q4 Marketing Campaign / Annual Legal Retainer with their status and AI-risk chips), and the footer pagination ("Showing 1-3 of 124 transactions"). Use `font-mono` for amounts.

- [ ] **Step 2: Create `app/transactions/page.tsx`**

```tsx
import TransactionsPage from '@/components/transactions/TransactionsPage';

export default function TransactionsRoute() {
  return <TransactionsPage />;
}
```

- [ ] **Step 3: Verify** — `npm run lint` and `npm run build` pass.
- [ ] **Step 4: Commit** — `git add app/transactions components/transactions && git commit -m "feat: add transactions route"`

---

### Task 14: Investigation queue route (`/investigation-queue`)

**Files:**
- Create: `app/investigation-queue/page.tsx`
- Create: `components/investigations/InvestigationQueuePage.jsx`

**Interfaces:**
- Consumes: `DashboardShell`.
- Produces: Route `/investigation-queue` — kanban board (Pending / In Progress / Review columns) with case cards (priority chip, id, title, description, assignee avatar).

- [ ] **Step 1: Create `components/investigations/InvestigationQueuePage.jsx`**

Port `investigation_queue_kinetic_light` main content into JSX inside `DashboardShell` (`title="Investigation Board"`, subtitle `"Manage and track active compliance investigations."`, actions = Filter secondary + New Case primary). Render 3 kanban columns with the mockup's case cards ("Unusual Wire Transfer Volume" #INV-2094 High Priority, and the other cards from the mockup).

- [ ] **Step 2: Create `app/investigation-queue/page.tsx`** (pattern from Task 13 Step 2).
- [ ] **Step 3: Verify** — lint + build pass.
- [ ] **Step 4: Commit** — `git add app/investigation-queue components/investigations && git commit -m "feat: add investigation queue route"`

---

### Task 15: AI configuration route (`/ai-configuration`)

**Files:**
- Create: `app/ai-configuration/page.tsx`
- Create: `components/ai-config/AiConfigurationPage.jsx`

**Interfaces:**
- Consumes: `DashboardShell`.
- Produces: Route `/ai-configuration` — Global Risk Parameters (range sliders for Base Risk Threshold 68% / AI Confidence Minimum 85%), Detection Rules toggles, Active Intelligence Models cards.

- [ ] **Step 1: Create `components/ai-config/AiConfigurationPage.jsx`**

Port `ai_configuration_kinetic_light` main content into JSX inside `DashboardShell` (`title="AI Configuration"`, subtitle `"Manage intelligence parameters, global risk thresholds, and automation rules."`). Keep the sliders (`<input type="range">`), toggle switches (checkbox + styled pill), and model cards with "Active" badges.

- [ ] **Step 2: Create `app/ai-configuration/page.tsx`** (pattern from Task 13 Step 2).
- [ ] **Step 3: Verify** — lint + build pass.
- [ ] **Step 4: Commit** — `git add app/ai-configuration components/ai-config && git commit -m "feat: add ai configuration route"`

---

### Task 16: Financial insights route (`/financial-insights`)

**Files:**
- Create: `app/financial-insights/page.tsx`
- Create: `components/insights/FinancialInsightsPage.jsx`

**Interfaces:**
- Consumes: `DashboardShell`.
- Produces: Route `/financial-insights` — Revenue Analytics chart (bar chart + gridlines), Actuals/AI Forecast segmented toggle, period selector.

- [ ] **Step 1: Create `components/insights/FinancialInsightsPage.jsx`**

Port `financial_insights_kinetic_light` main content into JSX inside `DashboardShell` (`title="Financial Insights"`, subtitle `"Deep-dive analytics and AI-driven forecasting."`). Keep the segmented toggle (Actuals active white pill + AI Forecast), the `Q3 2023 - YTD` select, the Revenue Analytics chart card with the labeled gridlines and grouped bars, and the AI forecast panel.

- [ ] **Step 2: Create `app/financial-insights/page.tsx`** (pattern from Task 13 Step 2).
- [ ] **Step 3: Verify** — lint + build pass.
- [ ] **Step 4: Commit** — `git add app/financial-insights components/insights && git commit -m "feat: add financial insights route"`

---

### Task 17: Executive reports route (`/executive-reports`)

**Files:**
- Create: `app/executive-reports/page.tsx`
- Create: `components/reports/ExecutiveReportsPage.jsx`

**Interfaces:**
- Consumes: `DashboardShell`.
- Produces: Route `/executive-reports` — report cards/summary and AI-generated report section.

- [ ] **Step 1: Create `components/reports/ExecutiveReportsPage.jsx`**

Port `executive_reports_kinetic_light` main content into JSX inside `DashboardShell` (`title="Executive Reports"`, subtitle from mockup). Keep the report cards (with share/download actions) and any AI insight panel with the lime left border.

- [ ] **Step 2: Create `app/executive-reports/page.tsx`** (pattern from Task 13 Step 2).
- [ ] **Step 3: Verify** — lint + build pass.
- [ ] **Step 4: Commit** — `git add app/executive-reports components/reports && git commit -m "feat: add executive reports route"`

---

### Task 18: Tool catalog route (`/tool-catalog`)

**Files:**
- Create: `app/tool-catalog/page.tsx`
- Create: `components/tools/ToolCatalogPage.jsx`

**Interfaces:**
- Consumes: `DashboardShell`.
- Produces: Route `/tool-catalog` — category tabs, tool integration cards with status badges, "Connect New Tool" primary button.

- [ ] **Step 1: Create `components/tools/ToolCatalogPage.jsx`**

Port `tool_catalog_kinetic_light` main content into JSX inside `DashboardShell` (`title="Tool Catalog"`, subtitle `"Manage connected services, APIs, and AI integrations."`, action = Connect New Tool primary button). Keep the category tabs and the tool cards.

- [ ] **Step 2: Create `app/tool-catalog/page.tsx`** (pattern from Task 13 Step 2).
- [ ] **Step 3: Verify** — lint + build pass.
- [ ] **Step 4: Commit** — `git add app/tool-catalog components/tools && git commit -m "feat: add tool catalog route"`

---

### Task 19: User management route (`/user-management`)

**Files:**
- Create: `app/user-management/page.tsx`
- Create: `components/users/UserManagementPage.jsx`

**Interfaces:**
- Consumes: `DashboardShell`.
- Produces: Route `/user-management` — Active Directory users table (avatar, name/email, role chip, team, status, actions), Audit Log + Invite User buttons.

- [ ] **Step 1: Create `components/users/UserManagementPage.jsx`**

Port `user_management_kinetic_light` main content into JSX inside `DashboardShell` (`title="User Management"`, subtitle `"Manage enterprise access and roles across divisions."`, actions = Audit Log secondary + Invite User primary). Keep the Active Directory table with the mockup rows (Sarah Jenkins Admin, etc.) and role/status chips.

- [ ] **Step 2: Create `app/user-management/page.tsx`** (pattern from Task 13 Step 2).
- [ ] **Step 3: Verify** — lint + build pass.
- [ ] **Step 4: Commit** — `git add app/user-management components/users && git commit -m "feat: add user management route"`

---

### Task 20: Vendors route (`/vendors`)

**Files:**
- Create: `app/vendors/page.tsx`
- Create: `components/vendors/VendorsPage.jsx`

**Interfaces:**
- Consumes: `DashboardShell`.
- Produces: Route `/vendors` — Vendor Risk Directory with vendor cards (risk badge, YTD spend, active contracts, payment trend sparkline, AI Risk Alert box).

- [ ] **Step 1: Create `components/vendors/VendorsPage.jsx`**

Port `vendors_kinetic_light` main content into JSX inside `DashboardShell` (`title="Vendor Risk Directory"`, subtitle `"Continuous AI assessment of supplier financial health and operational risk."`, action = Filter Risk secondary button). Keep the vendor cards (TechFlow Systems Inc. High Risk with `border-l-2 border-error`, plus the healthy vendors with `border-l-2 border-primary`), their stats, and AI Risk Alert boxes.

- [ ] **Step 2: Create `app/vendors/page.tsx`** (pattern from Task 13 Step 2).
- [ ] **Step 3: Verify** — lint + build pass.
- [ ] **Step 4: Commit** — `git add app/vendors components/vendors && git commit -m "feat: add vendors route"`

---

### Task 21: Re-skin auth (login + change-password)

**Files:**
- Modify: `components/auth/LoginPage.jsx`
- Modify: `components/auth/LoginPageClient.tsx`
- Modify: `components/auth/LoginCard.jsx`
- Modify: `components/auth/RoleTabs.jsx`
- Modify: `components/auth/BrandingHeader.jsx`
- Modify: `components/auth/ChangePasswordPage.jsx`
- Modify: `components/auth/ChangePasswordRouteClient.tsx`
- Modify: `components/auth/BackgroundAtmosphere.jsx`
- Modify: `components/common/Logo.jsx`
- Modify: `components/common/InputField.jsx`
- Modify: `components/common/PrimaryButton.jsx`

**Interfaces:**
- Consumes: New tokens from Task 10; existing `useAuth`/`api.js` unchanged.
- Produces: Re-skinned auth screens branded "Sentinel" using canonical tokens. Login page header `title="Sentinel"`, subtitle `"AI financial intelligence and risk analysis platform."`.

- [ ] **Step 1: Re-skin `BrandingHeader.jsx`**

Change default `title` to `"Sentinel"` and default `subtitle` to `"AI financial intelligence and risk analysis platform."`. Keep structure; use `font-headline-lg`, `text-on-surface`, `text-on-surface-variant`.

- [ ] **Step 2: Re-skin `LoginPage.jsx` + `LoginCard.jsx` + `RoleTabs.jsx`**

- Replace role tabs from Staff/Student education roles with financial roles: `{ id: 'admin', label: 'Admin', icon: 'admin_panel_settings' }` and `{ id: 'auditor', label: 'Auditor', icon: 'verified_user' }`. Keep `activeRole` state defaulting to `'admin'`. (Note: keep the `role` value passed to `loginApi` as-is from `activeRole`.)
- `LoginCard` → `bg-surface-container-lowest rounded-xl border border-outline-variant/80 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-6 md:p-8`.
- `RoleTabs` → container `bg-surface-container-low p-1.5 rounded-full gap-1 mb-6`, active tab `bg-white text-on-surface font-bold shadow-sm rounded-full`, inactive `text-on-surface-variant`.
- `LoginPage` → remove `BackgroundAtmosphere` (optional) or restyle to a `#f7f9ff` background with subtle lime glow; `main` max-w `[480px]`.

- [ ] **Step 3: Re-skin `PrimaryButton.jsx`**

Change to: `w-full bg-primary text-on-primary font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`.

- [ ] **Step 4: Re-skin `InputField.jsx`**

Border style → `rounded-lg border border-outline-variant bg-surface-container-low` with `focus:border-primary focus:ring-1 focus:ring-primary`; remove the old `border-b-2` underline style.

- [ ] **Step 5: Re-skin `LoginPageClient.tsx` + `ChangePasswordPage.jsx` + `ChangePasswordRouteClient.tsx`**

Replace hardcoded `bg-[#B9D9EB]` with `bg-background` and `text-primary` stays. `ChangePasswordPage` title header → `"Sentinel"` via `BrandingHeader` props; card → canonical card classes; strength bar colors keep `bg-error`/`bg-tertiary`/`bg-primary`.

- [ ] **Step 6: Re-skin `BackgroundAtmosphere.jsx` + `Logo.jsx`**

`BackgroundAtmosphere` → `bg-[#f7f9ff]`, lime glow orbs `#EDFF8C` at low opacity, keep dot grid. `Logo` → alt `"Sentinel Logo"`, keep `/paper-plane.png` image or swap to a shield icon.

- [ ] **Step 7: Verify**

Run: `npm run lint` and `npm run build`
Expected: both pass.

- [ ] **Step 8: Commit**

```bash
git add components/auth components/common
git commit -m "feat: re-skin auth screens to Sentinel design"
```

---

### Task 22: Final verification

**Files:**
- None (verification only).

- [ ] **Step 1: Full lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 3: Route smoke test**

Run the dev server (`npm run dev`), then verify these render without console errors and show the canonical sidebar/topbar/cards: `/`, `/transactions`, `/investigation-queue`, `/ai-configuration`, `/financial-insights`, `/executive-reports`, `/tool-catalog`, `/user-management`, `/vendors`. Also verify `/login` and `/change-password` show the Sentinel brand.

- [ ] **Step 4: Mockup smoke test**

Open each Lumina `code.html` in a browser and confirm it uses the lime `#EDFF8C` primary, 88px sidebar, canonical topbar, and white `rounded-xl` cards.

- [ ] **Step 5: Commit any stray changes**

```bash
git status --short
git add -A && git commit -m "chore: final verification cleanup" 2>/dev/null || true
```

---

## Self-Review Notes

- **Spec coverage:** Part A covers all 9 mockups (Tasks 2–9). Part B covers branding/tokens (10), shell (11), 9 routes (12–20), auth (21), verification (22).
- **Types consistent:** `DashboardShell` props (`title`, `subtitle`, `actions`, `placeholder`, `children`) defined in Task 11 and used identically in Tasks 12–20.
- **No placeholders:** Each task contains concrete code or precise copy-from references (canonical blocks in Task 1).
