# UI_GUIDELINES.md

## Design Direction
The product's whole premise is trust and control over something usually invisible (AI memory). The UI should feel **calm, transparent, and precise** — not playful, not chaotic, not "AI startup neon gradient." Think of it closer to a privacy/security dashboard (e.g., password manager, banking app) crossed with a chat product. Clarity beats decoration everywhere.

Two moods, one system:
- **Chat surface** — warm, conversational, low-friction.
- **Dashboard/Timeline surface** — structured, data-forward, audit-log feel.

Both share the same color/spacing/type system below so the product doesn't feel like two apps stitched together.

## Color Palette

Use CSS variables (`index.css`), never hardcoded hex values in components.

```css
:root {
  /* Base */
  --bg: #F7F8FA;
  --surface: #FFFFFF;
  --surface-raised: #FFFFFF;
  --border: #E4E7EC;
  --text-primary: #14171F;
  --text-secondary: #5B6270;
  --text-muted: #8A909E;

  /* Brand / primary — used for CTAs, active states, links */
  --primary: #4F5CFA;      /* indigo-violet: "trust + intelligence" without being generic SaaS blue */
  --primary-hover: #3F4AD1;
  --primary-soft: #EEF0FF; /* backgrounds for primary-tinted chips/badges */

  /* Retention/status semantics — used consistently everywhere retention appears */
  --forever: #4F5CFA;      /* permanent memory */
  --temporary: #E8A33D;    /* time-boxed memory */
  --session: #6FCF97;      /* session-only memory */
  --declined: #8A909E;     /* not remembered */
  --forgotten: #E85D5D;    /* revoked memory */

  /* Sensitivity scale (P2 feature) */
  --sensitivity-low: #6FCF97;
  --sensitivity-medium: #E8C13D;
  --sensitivity-high: #E8A33D;
  --sensitivity-critical: #E85D5D;

  /* Feedback */
  --success: #2FAE66;
  --error: #E5484D;
  --warning: #E8A33D;
}

[data-theme="dark"] {
  --bg: #0E0F13;
  --surface: #17181D;
  --surface-raised: #1E2027;
  --border: #2A2D36;
  --text-primary: #F2F3F5;
  --text-secondary: #A6ACBB;
  --text-muted: #6E7480;

  --primary: #6E79FF;
  --primary-hover: #8189FF;
  --primary-soft: #21234A;
  /* semantic + sensitivity colors stay the same hues, slightly desaturated is optional — don't overthink dark mode for a 24h build beyond bg/surface/text swap */
}
```

**Rule:** retention state (forever/temporary/session/declined/forgotten) always uses the same color everywhere it appears — negotiation card, dashboard badge, timeline icon. Color consistency here is not decoration, it's part of the "legibility" the PS is judged on.

## Typography

- Font: **Inter** (system-ui fallback) — legible, neutral, works at small sizes for dense dashboard/timeline rows
- Scale (Tailwind config, don't invent arbitrary sizes in components):

| Token | Size / Line-height | Use |
|---|---|---|
| `text-xs` | 12px / 16px | timestamps, metadata, badges |
| `text-sm` | 14px / 20px | body copy, chat messages, dashboard rows |
| `text-base` | 16px / 24px | primary UI text, form inputs |
| `text-lg` | 18px / 28px | card titles, section headers |
| `text-xl`–`text-2xl` | 20–24px | page titles ("Your Memories", "Chat") |

- Weight: 400 body, 500 for emphasis/labels, 600 for headings. Avoid 700+ except a single hero moment (e.g., empty-state heading) — heavy weights fight the calm tone.

## Spacing & Radius

- Spacing scale: strictly Tailwind defaults (4px increments) — `p-2, p-3, p-4, p-6, p-8`. No arbitrary `p-[13px]` values.
- Card padding: `p-4` (compact dashboard cards) to `p-6` (chat negotiation card, modals)
- Radius: `rounded-xl` (12px) for cards and modals, `rounded-full` for pills/badges/avatars, `rounded-lg` (8px) for buttons and inputs. Nothing sharp-cornered (`rounded-none`) — the whole UI should read as soft/approachable, matching the "negotiation, not interrogation" tone.
- Border: `1px solid var(--border)` on cards instead of heavy shadows as the primary separation technique — shadows are for elevation (modals, dropdowns), not for routine card boundaries.

## Buttons

- **Primary** — solid `--primary` bg, white text, `rounded-lg`, used for the main negotiation choice ("Remember Forever") and primary form submits. One primary button per view max.
- **Secondary** — white/surface bg, 1px border, `--text-primary` text — used for the other negotiation choices, cancel actions.
- **Destructive** — text/border in `--error`, transparent bg by default, filled `--error` bg only on hover/confirm — used for "Forget this memory." Never make destructive actions the visually loudest button on screen; loud-red-by-default reads as alarming for a routine, expected action.
- **Ghost/text** — no border, `--text-secondary`, used for tertiary actions (timeline "view details", filters)
- All buttons: `px-4 py-2` default size, `text-sm font-medium`, `transition-colors duration-150`. Disabled state: `opacity-50 cursor-not-allowed`, never hide a button as its disabled state.

## The Negotiation Card (most important component in the product)

This is the signature UI moment — treat it with more design care than anything else.
- Appears inline in the chat flow, not as a blocking modal — negotiation should feel like part of the conversation, not an interruption dialog. (This is a direct interaction-design response to the PS's warning against "a one-time settings toggle.")
- Structure: one line stating what was detected → four choice buttons in a row (Forever / 1 Week / This chat only / No thanks), each tinted with its retention color from the palette above at low opacity as a background wash, full color on hover/selection.
- Entrance: `Framer Motion` — slide-up + fade, ~200ms, `ease-out`. No bounce/spring — bounce reads as playful/toy-like, wrong tone for a consent moment.
- After a choice is made: card collapses to a single-line confirmation chip ("✓ Remembered for 1 week") that stays visible in the chat history — the user should be able to scroll back and see every negotiation decision they made, in place, without opening the dashboard.

## Cards (Dashboard/Timeline)

- Memory card: content text (`text-sm`), category tag (small pill, `--primary-soft` bg), retention badge (colored per the palette), sensitivity badge if P2 is built, and inline actions (edit retention, forget) revealed on hover — keep the default state clean/scannable, don't show every action at rest.
- Timeline row: icon (colored per action type: proposed/accepted/declined/forgotten/expired) + one-line description + relative timestamp (`text-xs text-muted`, e.g. "2h ago"). Git-log visual metaphor — vertical connecting line between rows, per your own design report's framing.

## Modals

- Used sparingly — only for destructive confirmation ("Forget this memory permanently?") and login. Do not use a modal for the negotiation flow itself (see above).
- Centered, `max-w-md`, `rounded-xl`, backdrop `bg-black/40`, backdrop click + Escape both close it.
- Framer Motion: fade + slight scale (0.96 → 1), ~150ms.

## Toasts

- Bottom-right, stack vertically, auto-dismiss 3–4s, manual close (×) always available.
- Success: `--success` left border accent on white/surface bg — not a fully filled green banner, keep it calm.
- Error: same pattern with `--error`.
- Used for: memory saved, memory forgotten, expiration occurred, API errors. Not used for routine chat message sends — no toast spam.

## Icons

- **Lucide React** icon set (matches Tailwind ecosystem, tree-shakeable, consistent stroke style)
- Stroke width 1.75–2, sized `16px` inline-with-text, `20px` standalone buttons, `24px` empty-state illustrations
- Icon-to-meaning consistency: 🕐/clock = temporary retention, ∞/infinity = permanent, 💬/message-circle = session-only, 🚫/circle-slash = declined, 🗑/trash = forgotten — reuse these exact icons everywhere that action/state appears

## Glassmorphism / Effects
- Used **only** on the negotiation card and possibly the top nav bar — `backdrop-blur-md` + `bg-surface/80` + `border border-white/20` (light mode) — signals "this is a special, active moment" without applying blur everywhere and cheapening the effect.
- Do **not** apply glassmorphism to dashboard cards, timeline rows, or forms — those surfaces should read as solid, stable, and archival, which reinforces "this is the real record," in visual contrast to the fleeting, glassy negotiation moment.

## Dark Mode
- Supported via `data-theme="dark"` attribute on `<html>`, toggled and persisted (in-memory/context is fine, per `TECH_SPEC.md`'s state rules — no localStorage requirement, but localStorage is acceptable here specifically since it's a pure UI preference, not memory data).
- All colors via CSS variables (see palette) — never a component-level `dark:` Tailwind class scattered ad hoc; keep theme logic centralized in the variable set.

## Responsive Rules
- Mobile-first breakpoints: base (mobile) → `md:` (tablet, 768px) → `lg:` (desktop, 1024px)
- Chat view: full-width on mobile, max-width `max-w-2xl` centered on desktop
- Dashboard: single column on mobile, `md:grid-cols-2`, `lg:grid-cols-3` for memory cards
- Negotiation card buttons: stack vertically on mobile (`flex-col`), horizontal row on `md:` and up — four buttons in a row on a phone screen is the single most common way this component breaks, check it explicitly

## Motion Principles (Framer Motion usage overall)
- Durations: 150–250ms for all UI transitions. Nothing longer — this is a functional tool, not a marketing site.
- Easing: `ease-out` for entrances, `ease-in` for exits. No spring/bounce physics anywhere — reinforces the calm/trustworthy tone over playful.
- Respect `prefers-reduced-motion` — disable non-essential transitions for users with that OS setting.

## What to Avoid
- No neon gradients, no glowing borders, no particle/AI-sparkle decoration — this is not being judged as a flashy AI demo, it's being judged as trustworthy, legible interaction design.
- No more than one accent color family (the indigo `--primary`) outside the semantic retention/sensitivity palettes — don't let teammates introduce a random second brand color for a single component.
- No dense walls of text in the negotiation card — one sentence stating what was detected, nothing else.
