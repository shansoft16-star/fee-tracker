# Design Brief

## Direction

Pine Ledger — a calm, trustworthy mobile fee-tracking ledger where money figures are the hero and every screen feels like a well-kept account book.

## Tone

Refined fintech restraint: deep pine-teal ink on warm paper, generous white space, zero decoration — confidence through clarity, not ornament.

## Differentiation

All monetary values render in tabular JetBrains Mono so columns of rupees align perfectly, while a single coral accent flags outstanding dues — the ledger reads at a glance.

## Color Palette

| Token      | OKLCH        | Role                                        |
| ---------- | ------------ | ------------------------------------------- |
| background | 0.975 0.008 165 | warm paper base                          |
| foreground | 0.22 0.03 200   | deep pine-teal ink text                  |
| card       | 1.0 0.002 165   | white list/summary surfaces              |
| primary    | 0.42 0.07 190   | deep pine-teal — app bar, active states  |
| accent     | 0.62 0.15 172   | bright teal — selected chips, highlights |
| muted      | 0.945 0.012 175 | muted mint fills, disabled               |
| success    | 0.55 0.14 150   | paid / collected amounts                 |
| destructive| 0.58 0.19 25    | outstanding dues, delete                 |

## Typography

- Display: Space Grotesk — app title, section headings, customer names
- Body: Plus Jakarta Sans — labels, mobile numbers, form fields, buttons
- Mono: JetBrains Mono — ALL currency figures (tabular-nums, tight tracking)
- Scale: hero `text-3xl font-bold tracking-tight`, h2 `text-xl font-semibold`, label `text-xs font-semibold tracking-widest uppercase`, body `text-sm`/`text-base`

## Elevation & Depth

Flat paper base with white cards lifted by `shadow-subtle`; summary cards use `shadow-elevated`; bottom nav floats on `shadow-nav`. No gradients on surfaces, no glow.

## Structural Zones

| Zone        | Background        | Border            | Notes                                              |
| ----------- | ----------------- | ----------------- | -------------------------------------------------- |
| App bar     | primary (pine)    | none              | white title left, round add button right           |
| Summary row | background        | —                 | 3 equal cards on `bg-card` with `shadow-elevated`  |
| Content     | background        | —                 | search + chips, then alternating `bg-card` rows    |
| Bottom nav  | card (white)      | border-t          | 3 items, active in primary, safe-area padded       |

## Spacing & Rhythm

`px-4` mobile gutters, `space-y-3` between customer cards, `space-y-6` between sections, `p-4` card padding, 44px minimum tap targets.

## Component Patterns

- Buttons: fully rounded pills, `bg-primary` primary / `bg-secondary` ghost; active scale-95 press
- Cards: `rounded-2xl` white, `shadow-subtle`, hairline `border-border`; summary cards `rounded-2xl` `shadow-elevated`
- Badges: pill, `bg-destructive/12 text-destructive` for dues pending; `bg-success/12 text-success` for paid
- Inputs: `rounded-xl` `bg-card` with `border-input`, `h-12` for thumb reach

## Motion

- Entrance: list rows `animate-fade-up` staggered 40ms; amounts `animate-count-in`
- Hover/press: `transition-smooth`, press scale-95 on tappable cards and buttons
- Decorative: none — motion is functional only

## Constraints

- Mobile-first; layout must feel native on a phone and install to the Android home screen
- Money must always use the mono tabular utility for column alignment
- Only fields: name, mobile, paid, due, total — no extra zones for excluded features
- Light mode primary; dark tokens defined but not the default experience

## Signature Detail

A left color-rail on each customer card — success green when fully paid, coral when dues remain — turning the list into a scannable ledger status board.
