# LandRetrieve Design System

## Brand Identity

**Product**: LandRetrieve.com  
**Legal**: © 2025 — SB.LAND — P.IVA IT 07385730481 | Tutti i diritti riservati  
**Tagline**: Rural real estate platform (ville, casali, agriturismi, aziende agricole, terreni)  
**Target markets**: UK, Germany, USA, Australia, Middle East, Africa

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--green` | `#26A55B` | Primary brand, CTAs, active states |
| `--green-dark` | `#1d8a4b` | Hover state for primary buttons |
| `--green-light` | `#e8f7ef` | Light green backgrounds, badges |
| `--green-xlight` | `#f0fbf5` | Very light green tints |
| `--green-accessible` | `#1a7a42` | WCAG AA text on white |
| `--bg` | `#ffffff` | Page background |
| `--light` | `#f5f5f5` | Section backgrounds, cards |
| `--border` | `#D4D4D4` | Borders, dividers |
| `--footer-bg` | `#CACACA` | Footer background |
| `--text` | `#111111` | Primary text |
| `--text-soft` | `#374151` | Secondary text |
| `--muted` | `#4b5563` | Muted/helper text |

### Tailwind Config Mapping
```js
colors: {
  green: {
    DEFAULT: '#26A55B',
    dark: '#1d8a4b',
    light: '#e8f7ef',
    xlight: '#f0fbf5',
    accessible: '#1a7a42',
  },
  border: '#D4D4D4',
  footer: '#CACACA',
}
```

---

## Typography

**Font Family**: Inter (Google Fonts)  
**Fallback**: `ui-sans-serif, system-ui, -apple-system, sans-serif`

| Scale | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | 48–64px | 700 | Hero headings |
| H1 | 36–40px | 700 | Page titles |
| H2 | 28–32px | 600 | Section headings |
| H3 | 22–24px | 600 | Card titles |
| Body Large | 18px | 400 | Lead paragraphs |
| Body | 16px | 400 | General text |
| Body Small | 14px | 400 | Captions, metadata |
| Caption | 12px | 400 | Labels, tags |

---

## Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| `--nav-h` | `72px` | Navbar height |
| `--max-w` | `1200px` | Max content width |
| `--radius` | `8px` | Base border radius |

### Grid
- Content max-width: `1200px`, centered with `px-4 sm:px-6 lg:px-8`
- Half-map layout (`/cerca`): **MAP LEFT, RESULTS RIGHT**
- Mobile-first breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`

---

## Components

### Navbar
- **Height**: 72px
- **Behavior**: Transparent on scroll-top → solid white with shadow on scroll
- **Logo**: LandRetrieve.com wordmark
- **CTA**: Green primary button (login/register)

### Buttons

> **CRITICAL RULES**:
> - **NEVER** add `box-shadow` to buttons
> - **NEVER** add `transform` on hover
> - Hover effect = **color change only**

```
Primary:   bg-green hover:bg-green-dark text-white
Secondary: border border-green text-green hover:bg-green-light
Ghost:     text-green hover:text-green-dark
Danger:    bg-red-600 hover:bg-red-700 text-white
```

### Cards (Property Listings)
- White background, `rounded-[8px]`
- Border: `1px solid #D4D4D4`
- No box-shadow on default state
- Hover: subtle border color change only

### Badges
- Connect plan: green background `#26A55B`
- Signature plan: gold/amber accent
- Categories: `bg-green-light text-green-accessible`

---

## Subscription Plans

> Plan names are **NEVER translated** — always displayed as-is in all languages.

| Plan | Monthly | Yearly |
|------|---------|--------|
| **LandRetrieve.com Connect** | €29.90/month | €322.92/year |
| **LandRetrieve.com Signature** | €29.90 base + €4.90 badge + €7.90/property featured | — |

- Prices shown **VAT INCLUDED** (IVA inclusa)

---

## Internationalization

- **22 languages** at launch, including Arabic (RTL support required)
- Language detection: ipapi.co
- Translation: DeepL / LibreTranslate
- RTL languages: Arabic — use `dir="rtl"` on `<html>`, mirror layouts

### Language List
`it`, `en`, `de`, `fr`, `es`, `pt`, `nl`, `pl`, `cs`, `ro`, `hu`, `sv`, `da`, `fi`, `el`, `hr`, `sk`, `bg`, `ar`, `zh`, `ja`, `ru`

---

## Legal & Compliance

- **GDPR**: Iubenda (cookie banner + privacy policy + terms)
- **reCAPTCHA**: v3 (invisible, all public forms)
- **Maps**: Google Maps API (key restricted to `landretrieve.com`)
- **Copyright footer**: `© 2025 — SB.LAND — P.IVA IT 07385730481 | Tutti i diritti riservati`

---

## Constraints & Rules

1. **NEVER** use "Toscana" in public-facing visible text
2. Map layout: **LEFT map, RIGHT results** on `/cerca`
3. Contact form → creates internal thread (NOT direct email)
4. Agent receives only email notification: "Hai ricevuto un messaggio"
5. "Fai la tua offerta" button: **only on SALE listings**, never on rental
6. Stripe: price IDs from env vars, never hardcoded
7. All image uploads: Cloudflare R2

---

## Icons

Library: `lucide-react`  
Consistent size: `16px` inline, `20px` UI elements, `24px` prominent actions

---

## Animations & Transitions

- Duration: `150ms` for micro-interactions, `300ms` for panel transitions
- Easing: `ease-in-out`
- **No** entrance animations on list items (performance)
- Skeleton loaders for async content (not spinners)
