---
name: Academic Excellence
colors:
  surface: '#faf9fd'
  surface-dim: '#dbd9dd'
  surface-bright: '#faf9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f7'
  surface-container: '#efedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1a1b1e'
  on-surface-variant: '#45483b'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f4'
  outline: '#76796a'
  outline-variant: '#c6c8b7'
  surface-tint: '#516522'
  primary: '#516522'
  on-primary: '#ffffff'
  primary-container: '#daf39f'
  on-primary-container: '#5b702b'
  inverse-primary: '#b8d080'
  secondary: '#69577c'
  on-secondary: '#ffffff'
  secondary-container: '#e9d1fd'
  on-secondary-container: '#6a577d'
  tertiary: '#725a36'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffe5c3'
  on-tertiary-container: '#7d643f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3ec99'
  primary-fixed-dim: '#b8d080'
  on-primary-fixed: '#151f00'
  on-primary-fixed-variant: '#3a4d0a'
  secondary-fixed: '#efdbff'
  secondary-fixed-dim: '#d5bee9'
  on-secondary-fixed: '#241435'
  on-secondary-fixed-variant: '#513f63'
  tertiary-fixed: '#ffdeb0'
  tertiary-fixed-dim: '#e1c296'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#594321'
  background: '#faf9fd'
  on-background: '#1a1b1e'
  surface-variant: '#e3e2e6'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system shifts away from traditional, heavy academic aesthetics toward a modern, friendly, and accessible educational environment. The brand personality is optimistic and clear, designed to reduce cognitive load and evoke a sense of calm productivity. 

The visual style is **Corporate / Modern** with a soft, playful edge. It utilizes a spacious layout, generous rounded corners, and a pastel-driven color palette to create an inviting atmosphere for learners and educators alike. The interface avoids aggressive gradients or harsh shadows, opting instead for clean lines and subtle tonal layering.

## Colors

The palette is anchored by a soft light-blue background that provides a non-white canvas to reduce glare.
- **Primary (Lime Green):** Used for primary actions, success states, and progress indicators.
- **Secondary (Lavender):** Used for creative tasks, accent elements, and secondary categorization.
- **Tertiary (Peach):** Used for warnings, notifications, or highlighting specific focus areas.
- **Neutrals:** Dark Charcoal (#202124) provides high-contrast legibility for text, while Off-White (#F5F5F4) and pure White (#FFFFFF) are used for surface containers to create depth.

## Typography

Manrope is the sole typeface for this design system, chosen for its geometric balance and excellent legibility across digital scales. 
- **Headlines:** Use Bold (700) or Semi-Bold (600) weights with slightly tightened letter spacing for a modern, compact look.
- **Body Text:** Use Regular (400) weight. Ensure line heights remain generous (1.5x minimum) to maintain accessibility for educational reading.
- **Labels:** Use Medium (500) or Semi-Bold (600) for UI controls, buttons, and navigation items.

## Layout & Spacing

The design system utilizes a **Fluid Grid** model based on an 8px rhythmic scale. 
- **Desktop:** 12-column grid with 24px gutters and 48px outside margins.
- **Tablet:** 8-column grid with 24px gutters and 32px outside margins.
- **Mobile:** 4-column grid with 16px gutters and 16px outside margins.

Spacing should prioritize "breathing room" to keep the educational interface from feeling cluttered. Use `md` (24px) for most internal padding within cards and `lg` (48px) for vertical section spacing.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** rather than heavy shadows. 
- **Level 0 (Background):** The light blue (#B9D9EB) canvas.
- **Level 1 (Surfaces):** Off-white (#F5F5F4) cards or containers used to group content.
- **Level 2 (Active/Floating):** Pure white (#FFFFFF) for elements that require immediate focus, such as active input fields or modals.

Shadows, when used (e.g., for modals or floating action buttons), should be extremely soft: `0px 10px 30px rgba(32, 33, 36, 0.05)`, creating a subtle lift without introducing visual noise.

## Shapes

The shape language is consistently **Rounded**, reinforcing the friendly and accessible brand personality. 
- Base components (buttons, inputs) use a 0.5rem (8px) radius.
- Large containers (cards, modals) use 1rem (16px) radius.
- Tags and decorative elements can utilize "Pill-shaped" (full radius) treatments to distinguish them from functional UI components.

## Components

### Buttons
- **Primary:** Lime Green (#DAF39F) background with Charcoal (#202124) text. Bold weight.
- **Secondary:** Lavender (#EBD3FF) background or outlined Charcoal.
- **Ghost:** No background, Charcoal text, used for less prominent actions.

### Input Fields
Filled style using Off-White (#F5F5F4) background with a subtle Charcoal bottom border (2px) that transforms into a Lime Green border on focus.

### Cards
White (#FFFFFF) background with Rounded-LG (16px) corners. Use a very subtle 1px border in a darkened version of the background blue instead of a shadow to maintain a clean, "flat-plus" look.

### Chips & Tags
Pill-shaped. Use the Peach (#FFDEB0) and Lavender (#EBD3FF) palettes for status-based tagging (e.g., "In Progress," "Completed").

### Progress Bars
Thick, 12px height with fully rounded caps. Track color: Off-White. Fill color: Lime Green.