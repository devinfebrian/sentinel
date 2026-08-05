---
name: Kinetic Analyst
colors:
  surface: '#f6fbf6'
  surface-dim: '#d6dbd7'
  surface-bright: '#f6fbf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f5f1'
  surface-container: '#eaefeb'
  surface-container-high: '#e4e9e5'
  surface-container-highest: '#dfe4e0'
  on-surface: '#171d1b'
  on-surface-variant: '#464838'
  inverse-surface: '#2c322f'
  inverse-on-surface: '#edf2ee'
  outline: '#777867'
  outline-variant: '#c7c8b3'
  surface-tint: '#576400'
  primary: '#576400'
  on-primary: '#ffffff'
  primary-container: '#edff8c'
  on-primary-container: '#687710'
  inverse-primary: '#becf63'
  secondary: '#536350'
  on-secondary: '#ffffff'
  secondary-container: '#d6e8d0'
  on-secondary-container: '#586956'
  tertiary: '#585f68'
  on-tertiary: '#ffffff'
  tertiary-container: '#f0f6ff'
  on-tertiary-container: '#697179'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#daec7b'
  primary-fixed-dim: '#becf63'
  on-primary-fixed: '#191e00'
  on-primary-fixed-variant: '#414c00'
  secondary-fixed: '#d6e8d0'
  secondary-fixed-dim: '#bacbb5'
  on-secondary-fixed: '#111f11'
  on-secondary-fixed-variant: '#3b4b3a'
  tertiary-fixed: '#dce3ed'
  tertiary-fixed-dim: '#c0c7d1'
  on-tertiary-fixed: '#151c23'
  on-tertiary-fixed-variant: '#40474f'
  background: '#f6fbf6'
  on-background: '#171d1b'
  surface-variant: '#dfe4e0'
typography:
  display-lg:
    fontFamily: Urbanist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Urbanist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Urbanist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Urbanist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  kpi-value:
    fontFamily: Urbanist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  table-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 32px
  gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system for the AI Financial Analyst platform is built on a philosophy of **Executive Precision** and **Kinetic Intelligence**. It targets high-level decision-makers who require rapid data synthesis without the cognitive load of traditional, dense financial terminals.

The style is a hybrid of **Minimalism** and **Modern Corporate**, utilizing a high-energy "soft chartreuse" accent to signify the "kinetic" AI layer atop a grounded, professional foundation. The interface should feel calm, spacious, and authoritative, evoking an emotional response of clarity and confidence. Visual density is replaced by intelligent grouping and generous white space.

## Colors
The palette is designed to reduce eye strain during long analytical sessions.
- **Primary (#EDFF8C):** Used exclusively for high-priority actions, AI-generated insights, and focal points. It represents the "intelligence" layer.
- **Background (#E9EEEA):** A sophisticated off-white with a green-gray undertone that provides a soft canvas, preventing the starkness of pure white.
- **Surface (#FFFFFF):** Reserved for content cards and data modules to create clear containment and elevation.
- **Secondary Tints:** Used for subtle categorizations, sidebar backgrounds, and secondary button states.
- **Semantic Palette:** Desaturated tones are used for risk badges and status indicators to maintain the calm aesthetic while remaining functional.

## Typography
The typographic hierarchy distinguishes between **Analytical Outcomes** (Urbanist) and **Data Processing** (Inter).

- **Urbanist:** Use for all numerical values, KPIs, and major section headings. The geometric, rounded nature feels modern and accessible.
- **Inter:** Use for all body copy, dense financial tables, and technical labels. It provides the necessary legibility for complex financial strings.
- **KPI Values:** These should be treated as hero elements, often paired with the primary accent color or a subtle background tint to draw immediate attention.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for dashboard views to ensure data alignment, transitioning to a **Fluid Grid** for report reading.

- **Desktop:** 12-column grid with 24px gutters. Wide 32px margins to create a "contained" executive feel.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters.
- **Rhythm:** Use an 8px base unit. Data-heavy tables should use a tighter "stack-sm" (12px) for vertical row rhythm, while sections should be separated by "stack-lg" (48px) to maintain the "calm hierarchy."

## Elevation & Depth
Depth is conveyed through **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Background):** #E9EEEA. The foundation.
- **Level 1 (Cards):** #FFFFFF. These use a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.04)`.
- **Level 2 (Interactive/Hover):** Enhanced shadow: `0px 8px 30px rgba(0, 0, 0, 0.08)`.
- **AI Insights:** Elements highlighting AI suggestions should use a subtle inner glow of the Primary color (#EDFF8C) rather than a traditional shadow to denote their "kinetic" nature.

## Shapes
The design system utilizes a **Soft Rounded** aesthetic to move away from the "sharp" and intimidating look of traditional finance.

- **Standard Components:** All buttons, cards, and input fields use a **14px radius**. 
- **Small Components:** Tags and badges use a 6px radius to maintain visual proportion.
- **Selection Indicators:** Active states in navigation or list items use a vertical pill shape (fully rounded) on the leading edge.

## Components
- **Buttons:** Primary buttons use the Primary color (#EDFF8C) with dark text. Secondary buttons use a #D8DFE9 ghost style. All buttons have a height of 48px for a premium feel.
- **AI Insight Cards:** These cards feature a 2px left-border of the Primary color and a #FFFFFF surface to differentiate them from standard data cards.
- **Data Tables:** High-legibility Inter font. Header rows should be #D8DFE9 with 12px Label-sm text. No vertical borders; use subtle #E9EEEA horizontal dividers.
- **Risk Badges:** Small, pill-shaped indicators using the semantic coral and red tones with 50% opacity backgrounds for a "muted" executive look.
- **Input Fields:** 14px rounded corners, #FFFFFF background, and a 1px border of #CFE1CA. On focus, the border shifts to a slightly darker sage, never the high-contrast Primary color.
- **KPI Widgets:** A combination of an Urbanist value and a small Sparkline. The Sparkline should use the Primary color for growth and a muted Coral for decline.
