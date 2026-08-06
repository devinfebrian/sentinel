# Transactions and Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match supplied AI Financial Analyst transaction design while making the existing toggleable sidebar transition stable.

**Architecture:** Keep Zustand as the single sidebar state source and use one CSS transition contract for the 64px collapsed rail, 260px expanded sidebar, and main content offset. Keep navigation labels mounted and animate their visibility instead of conditionally removing them. Restyle the existing transaction page in place, preserving its API calls and real data fields.

**Tech Stack:** Next.js 16.2.12, React 19.2.4, Tailwind CSS 4, Zustand 5, Material Symbols, TypeScript.

## Global Constraints

- Keep sidebar toggle behavior and existing authorization filtering.
- No transaction API or database schema changes.
- Do not fabricate division, AI status, risk, or record data.
- Keep current transaction loading, filtering, sorting, pagination, editing, importing, and vendor drawer behavior.
- Use CSS transitions; do not migrate to an animation library.
- Support responsive layouts and `prefers-reduced-motion`.
- Existing lint baseline has unrelated errors; report baseline versus new failures.

---

### Task 1: Stabilize Dashboard Shell Motion

**Files:**
- Modify: `components/SideNav.tsx:23-84`
- Modify: `components/DashboardLayoutWrapper.tsx:6-14`
- Modify: `app/globals.css:195-215`

**Interfaces:**
- Consumes: `useSidebarStore().isCollapsed` and `toggleSidebar()`.
- Produces: A 64px collapsed sidebar, 260px expanded sidebar, and matching main-content offset with synchronized CSS timing.

- [ ] **Step 1: Define one transition contract in the shell classes**

Use the same width values, duration, and easing on both sidebar width and main margin. Keep the collapsed and expanded values explicit so the two components cannot drift:

```tsx
const sidebarWidth = isCollapsed ? 'md:ml-[64px]' : 'md:ml-[260px]';

return (
  <div
    className={`flex min-w-0 flex-1 flex-col h-full overflow-hidden transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarWidth}`}
  >
```

Apply the corresponding `w-[64px]` or `w-[260px]` class to `SideNav` with the same transition declaration. Do not add a second state source.

- [ ] **Step 2: Keep the navigation label DOM stable**

Render each nav label in both states and animate only its visual presence. Use a fixed icon slot so the icon does not jump when the state changes:

```tsx
<Link className="flex h-10 w-full items-center rounded-xl px-2 transition-colors duration-200">
  <span className="flex h-10 w-10 shrink-0 items-center justify-center">
    <span className="material-symbols-outlined">{item.icon}</span>
  </span>
  <span
    aria-hidden={isCollapsed}
    className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'pointer-events-none max-w-0 -translate-x-2 opacity-0' : 'ml-2 max-w-[160px] translate-x-0 opacity-100'}`}
  >
    {item.label}
  </span>
</Link>
```

Use the same fixed icon slot for the brand mark. Preserve `title` in collapsed mode and add `aria-expanded`/`aria-label` to the toggle button.

- [ ] **Step 3: Align active and hover treatment with the reference rail**

Use rounded-xl icon treatments for the collapsed rail and preserve readable expanded labels. Keep active navigation based on `pathname`, retain admin filtering, and avoid changing routes.

- [ ] **Step 4: Add reduced-motion handling**

Add a global media rule after the existing animation declarations:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Run shell type verification**

Run: `npx tsc --noEmit`

Expected: no new TypeScript errors from shell changes.

### Task 2: Match Shared Top Bar Hierarchy

**Files:**
- Modify: `components/TopAppBar.tsx:7-88`
- Modify: `app/(dashboard)/layout.tsx:14-27`

**Interfaces:**
- Consumes: Existing `user`, `clearSession`, and `router.replace('/login')` behavior.
- Produces: Reference-style 64px top bar with page context, search affordance, utility controls, and working account menu.

- [ ] **Step 1: Preserve account and logout behavior before changing markup**

Keep `handleLogout`, `roleLabel`, menu click handling, backdrop, and menu semantics unchanged. Only move them into the new right-side layout.

- [ ] **Step 2: Add reference top-bar structure**

Use `Ledger Actions` as the left context title, a centered search input with placeholder `Search transactions, entities...`, notification and settings icon buttons with accessible labels, and the existing account button/menu on the right. Keep the search input presentational because transaction search remains page-owned and no global search API exists.

- [ ] **Step 3: Keep shell dimensions aligned**

Use `h-16`, `border-b`, surface background, and `min-w-0` on the header/content relationship. Do not add fixed positioning that can create horizontal overflow during sidebar transitions.

- [ ] **Step 4: Verify account interaction**

Run the app and verify account menu opens, closes through backdrop, and logs out to `/login` exactly as before.

### Task 3: Restructure Transactions Toolbar and Table

**Files:**
- Modify: `app/(dashboard)/transactions/page.tsx:262-570`

**Interfaces:**
- Consumes: Existing transaction state, API functions, `Pagination`, `ImportDialog`, `TransactionDialog`, and `VendorDrawer`.
- Produces: Reference-style transaction page using current API-backed fields and controls.

- [ ] **Step 1: Preserve data and event logic**

Keep `fetchTransactions`, debounce behavior, server filters, vendor refinement, sorting, pagination callbacks, `handleEditClick`, `handleAddNewClick`, and overlay props. Do not add unsupported `division`, `dateRange`, or `aiStatus` properties.

- [ ] **Step 2: Replace page header copy and action treatment**

Use the reference hierarchy:

```tsx
<h1>Transactions</h1>
<p>Manage and review categorized ledger entries. AI models have pre-processed recent uploads.</p>
```

Keep `Import Excel` as secondary and rename the primary action to `Add Transaction`. Use 48px button height, reference surfaces, rounded corners, borders, and ambient shadow classes.

- [ ] **Step 3: Build compact filter toolbar from supported controls**

Use one horizontal toolbar that wraps on smaller widths. Include:

```tsx
<span>Filters</span>
<input placeholder="Search transactions..." />
<select aria-label="Filter by type">...</select>
<select aria-label="Filter by category">...</select>
<select aria-label="Filter by vendor">...</select>
<select aria-label="Sort transactions">...</select>
<span>Showing {totalItems} records</span>
<button disabled aria-label="Export transactions">download</button>
```

Keep input/select values wired to existing state. Disable the export affordance because no export API exists; do not create a fake download.

- [ ] **Step 4: Restyle table without changing data shape**

Keep columns `No.`, `Date`, `Description`, `Category`, `Type`, `Vendor`, `Amount`, and `Actions`. Use the reference table container, `tertiary-fixed` header, 14px table data, horizontal dividers, compact row padding, right-aligned amount, and hover-revealed edit action. Keep vendor names as buttons opening `VendorDrawer`.

- [ ] **Step 5: Preserve responsive behavior**

Keep the table inside `overflow-x-auto` with a minimum width. Make header actions and filter toolbar wrap rather than overflow the viewport. Keep page content scrollable inside the dashboard canvas.

- [ ] **Step 6: Run TypeScript verification**

Run: `npx tsc --noEmit`

Expected: no new TypeScript errors from transaction markup changes.

### Task 4: Verify Visual and Behavioral Contract

**Files:**
- Modify: none
- Inspect: `components/SideNav.tsx`, `components/DashboardLayoutWrapper.tsx`, `components/TopAppBar.tsx`, `app/(dashboard)/transactions/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: Completed shell and transaction implementation.
- Produces: Evidence that the approved visual and interaction requirements hold.

- [ ] **Step 1: Run formatting and static checks**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `npm run lint`

Expected: output may retain the pre-existing lint errors in transaction effects, vendor effects, pagination, animated grid, and API typing. Confirm no new errors in modified shell markup or transaction JSX beyond that baseline.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: build completes successfully. If environment/API configuration blocks build, record exact blocker instead of claiming success.

- [ ] **Step 3: Manually verify sidebar transition matrix**

At desktop width verify:

```text
collapsed -> expanded: icons stay aligned, labels reveal smoothly, content offset follows sidebar
expanded -> collapsed: labels fade/clip before they can affect layout, no text overlap, no horizontal scrollbar
rapid repeated toggles: no stale label state, no layout jump after settling
reduced motion: state changes without decorative animation
```

- [ ] **Step 4: Manually verify transaction matrix**

Verify page load, search debounce, type/category/vendor filters, sort, pagination, edit dialog, import dialog, vendor drawer, account menu, and mobile horizontal table scrolling. Confirm unsupported reference fields are not shown as fake data.

- [ ] **Step 5: Review final diff**

Run: `git status --short` and `git diff --stat`

Expected: only approved spec/plan and shell/transaction files are changed; no generated files or secrets are included.
