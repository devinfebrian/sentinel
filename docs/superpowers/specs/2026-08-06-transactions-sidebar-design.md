# Transactions and Sidebar Design

## Context

Transactions page should match supplied AI Financial Analyst reference. Sidebar should keep its current toggle, but its collapsed state should behave like reference 64px icon rail. Current sidebar changes width and main margin independently while also removing labels from the DOM immediately. That combination causes visible reflow and unstable alignment during open and close transitions.

Current transaction API exposes date, amount, type, category, description, vendor, and input user fields. It does not expose division or AI status, so the UI must not fabricate those values.

## Goals

- Match reference visual hierarchy, spacing, colors, controls, and table treatment.
- Preserve expanded sidebar mode and existing navigation behavior.
- Make sidebar open/close transition stable and consistent across dashboard pages.
- Keep transaction loading, filtering, pagination, editing, importing, and vendor drawer behavior working.
- Support responsive layouts and reduced-motion preferences.

## Non-goals

- No transaction API or database schema changes.
- No fabricated division, AI status, risk, or record data.
- No unrelated auth, administration, vendor-data, or dashboard feature changes.
- No animation-library migration.

## Approved Approach

Use a shared CSS motion contract. Sidebar uses a 64px collapsed width and 260px expanded width. Main content offset uses the same state and duration. Both transitions use one easing curve. Navigation labels remain mounted during the transition and animate through opacity, clipping, and translation instead of disappearing synchronously with the state change. Icon positions remain fixed in both states.

The shell keeps the existing Zustand state and toggle action. Motion stays CSS-driven because width, margin, opacity, and transform are sufficient and avoid adding runtime animation coordination.

Respect `prefers-reduced-motion` by disabling non-essential transitions and page-entry animation.

## Shell Changes

- Update `SideNav` to reference-style 64px rail when collapsed and retain 260px expanded mode.
- Keep the logo, navigation, active state, toggle button, and authorization filtering.
- Keep labels in the render tree with controlled visibility so close/open does not snap layout.
- Update `DashboardLayoutWrapper` to use matching content offset and transition timing.
- Align `TopAppBar` with reference hierarchy: page context, search affordance, notifications, settings, and account control while preserving logout behavior.
- Keep the dashboard shell usable on mobile; current desktop sidebar remains hidden below the existing breakpoint.

## Transactions Page

- Use reference page title, supporting copy, and action hierarchy.
- Style Import Excel as secondary and Add Transaction as primary.
- Replace the large stacked filter card with a compact toolbar containing filter context, supported current filters, record count, and export affordance.
- Keep backend-supported type, category, vendor, search, sorting, and pagination behavior. Date-range and division controls are not added without corresponding data/API support.
- Restyle table using reference row height, header tone, horizontal dividers, checkbox/action affordances, vendor links, and amount alignment.
- Keep current real transaction fields: date, description, category, type, vendor, amount, and edit action.
- Preserve horizontal overflow for dense table content on narrow screens.

## Overlay Behavior

Existing import dialog, transaction dialog, and vendor drawer remain functionally unchanged. Their visual treatment should use the same reference surfaces, borders, shadows, and easing where touched. Drawer close behavior must not regress; if close animation requires keeping it mounted, that change remains local to the drawer.

## Verification

- Run TypeScript/build checks after implementation.
- Run lint and distinguish existing baseline failures from new failures.
- Manually verify sidebar open and close at desktop width, including rapid repeated toggles.
- Verify transaction page at desktop, tablet, and mobile widths.
- Verify transaction search, filters, pagination, edit, import, and vendor drawer interactions.
- Verify reduced-motion behavior.
