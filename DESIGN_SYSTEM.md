# LandRetrieve.com — Design System
> Estratto dalla landing page ufficiale (LandRetrieve_Landing_7.html)
> Fonte di verità per tutti i componenti UI del progetto.

---

## 1. COLORI

### CSS Variables (fonte: `:root`)
```css
:root {
  --green:             #26A55B;   /* primary — bottoni, accenti, CTA */
  --green-dark:        #1d8a4b;   /* hover bottoni primari */
  --green-light:       #e8f7ef;   /* icon bg, badge, tag */
  --green-xlight:      #f0fbf5;   /* sfondi sezioni leggere (CTA band, overview bar) */
  --green-accessible:  #1a7a42;   /* testo verde su sfondo bianco (ratio 4.5:1 WCAG AA) */
  --bg:                #ffffff;   /* sfondo pagine */
  --border:            #D4D4D4;   /* tutti i bordi */
  --footer-bg:         #CACACA;   /* footer + sidebar dashboard */
  --dash-bg:           #CACACA;   /* background sidebar dashboard */
  --text:              #111111;   /* testo principale */
  --text-soft:         #374151;   /* testo secondario (ratio 10:1) */
  --muted:             #4b5563;   /* testo terziario, label, link nav */
  --light:             #f5f5f5;   /* sfondi sezioni chiare, trust bar */
}
```

### Colori semantici per componente
| Contesto | Colore |
|---|---|
| Body text | `#1a1a1a` (usato in body) / `#111111` (var --text) |
| Link nav (solid) | `#4b5563` → hover `#111111` |
| Link nav (transparent) | `rgba(255,255,255,.88)` → hover `#fff` |
| Eyebrow text | `#1a7a42` |
| Eyebrow line `::after` | `#D4D4D4` |
| Footer link | `#3a3a3a` → hover `#26A55B` |
| Footer text | `#3a3a3a` |
| Footer copyright | `#5a5a5a` |
| Footer bottom links | `#5a5a5a` → hover `#26A55B` |
| Badge/tag testo | `#26A55B` |
| Badge/tag bg | `#e8f7ef` |
| Trust bar bg | `#f5f5f5` |
| Trust bar border | `#D4D4D4` |
| Hero overlay | `linear-gradient(to bottom, rgba(0,0,0,.35) 0%, rgba(0,0,0,.5) 100%)` |
| Hero H1 | `#ffffff` |
| Hero subtitle | `rgba(255,255,255,.96)` |
| Hero em (italic) | `rgba(255,255,255,.85)` |
| Sezione dark (internazionale) | `linear-gradient(150deg, #0a1f12 0%, #0f2a1a 50%, #122b1b 100%)` |
| Testo su dark | `#fff` / `rgba(255,255,255,.65)` |
| Card dark regioni bg | `rgba(255,255,255,.06)` |
| Card dark regioni border | `rgba(255,255,255,.1)` |
| Card dark regioni hover bg | `rgba(255,255,255,.1)` |
| Card dark regioni hover border | `rgba(38,165,91,.3)` |
| Compare bar bg | `#1a1a1a` |
| Dashboard main bg | `#f5f5f5` |
| Dashboard topbar bg | `#ffffff` |
| Dashboard topbar border | `#D4D4D4` |
| Dashboard active item bg | `rgba(38,165,91,0.12)` |
| Dashboard active item border | `#26A55B` (3px left) |
| Dashboard active item color | `#1a7a42` |

### Social icons
```
Facebook:  #1877F2
Instagram: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)
LinkedIn:  #0A66C2
```

### Hover / Focus
- Bottone primario hover: `#1d8a4b` (var --green-dark)
- Bottone outline hover: `border-color: #26A55B; color: #26A55B`
- Input focus: `border-color: #26A55B; background: #fff`
- Nav link hover (solid): `color: #111111`
- Nav link hover (transparent): `color: #fff`
- Feature card icon hover: `background: #26A55B; transform: scale(1.1)`
- **MAI box-shadow o transform sui bottoni** — solo cambio colore

---

## 2. TIPOGRAFIA

### Font family
```css
font-family: 'Inter', sans-serif;
/* Import: */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### Font weights usati
| Weight | Uso |
|---|---|
| 300 | Sottotitoli hero, testo leggero, hero subtitle |
| 400 | Testo corrente `body` |
| 500 | Nav links, bottone Accedi, nav-lang |
| 600 | H2–H6, sezione titoli, bottone Registrati |
| 700 | H1 hero, eyebrow, label form, btn-reg, btn-search |

### Scale tipografica
| Elemento | Size | Weight | Line-height | Letter-spacing | Note |
|---|---|---|---|---|---|
| H1 Hero | `clamp(3rem, 7vw, 5.5rem)` | 700 | 1.2 | — | `<em>` italic fw 300 |
| H2 / Section title | `clamp(1.75rem, 3vw, 2.4rem)` | 600 | 1.15 | — | max-width 580px |
| H2 dark section | `clamp(1.75rem, 3vw, 2.4rem)` | 600 | 1.15 | — | color #fff, max-width 480px |
| H2 CTA | `clamp(1.5rem, 3vw, 2rem)` | 600 | — | — | |
| H3 card title | `1rem` | 600 | — | — | color #fff su tipo-card |
| Body | `1rem` | 400 | 1.6 | — | |
| Section subtitle | `1rem` | 400 | — | — | color var(--text-soft), max-width 520px |
| Nav link | `1rem` | 500 | — | `0.01em` | |
| Btn login/reg | `0.925rem` | 500/600 | — | — | |
| Btn hero | `0.95rem` | 600 | — | — | |
| Btn search | `0.9rem` | 700 | — | — | |
| Btn prof (card) | `0.82rem` | 600 | — | — | |
| Eyebrow | `0.72rem` | 700 | — | `0.14em` | uppercase, color #1a7a42 |
| Hero eyebrow | `0.75rem` | 600 | — | `0.14em` | uppercase, color rgba(255,255,255,.7) |
| Tag/badge | `0.68rem` | 700 | — | — | uppercase, color #26A55B |
| Trust item | `0.82rem` | 500 | — | — | color var(--muted) |
| Small / footer link | `0.875rem` | 400 | — | — | color #3a3a3a |
| Footer col header | `0.72rem` | 700 | — | `0.1em` | uppercase |
| Footer bottom | `0.78rem` | 400 | — | — | |
| Footer bottom links | `0.75rem` | 400 | — | — | |
| Footer settings h4 | `0.68rem` | 700 | — | `0.08em` | uppercase |
| Nav lang | `0.8rem` | 500 | — | — | |
| Label form | `0.78rem` | 700 | — | `0.06em` | uppercase, color #4b5563 |
| Input text | `0.88rem` | 400 | — | — | |
| Stats number (dark) | `2rem` | 700 | — | — | color #fff |
| Stats label (dark) | `0.78rem` | 400 | — | — | color rgba(255,255,255,.5) |
| Scroll hint | `0.68rem` | 600 | — | `0.1em` | uppercase |
| Mobile menu link | `0.9rem` | 500 | — | — | |

---

## 3. SPACING

### Padding sezioni
| Contesto | Desktop | Tablet (≤1024px) | Mobile (≤640px) |
|---|---|---|---|
| `.section` | `6rem 3rem` | `4rem 1.5rem` | `3rem 1rem` |
| `.navbar` | `20px 3rem` | `0 1.5rem` | `0 1rem` |
| `.trust-bar` | `1.25rem 3rem` | — | `1rem` |
| `.hero-search` | `1.5rem 3rem` | `0 1.5rem 2rem` | `1rem` |
| `.cta-band` | `4.5rem 3rem` | — | `3rem 1rem` |
| `footer` | `3rem 3rem 1.5rem` | — | `0.75rem 1rem 2.5rem` |
| Dashboard main | `2rem` | — | — |

### Gap tra elementi
| Contesto | Gap |
|---|---|
| Nav right (buttons) | `0.6rem` |
| Nav links | `2px` |
| Hero CTA group | `1rem` |
| Trust items | `3rem` (desktop) / `1.5rem` (tablet) |
| Connessioni grid | `5rem` |
| Professionisti grid | `1.5rem` |
| Tipologie grid | `1rem` |
| Features grid | `1px` (divider) |
| Intl stats | `1.5rem` |
| Intl cards | `0.75rem` |
| Footer top | `3rem` |
| Footer socials | `0.5rem` |
| Setting rows | `0.4rem` |
| Footer bottom links | `1.25rem` |
| Conn list items | `1.25rem` |
| Conn list icon + text | `1rem` |

### Border radius
| Elemento | Radius |
|---|---|
| Default (`--radius`) | `8px` |
| Bottoni primari (hero, cta, search) | `6px` |
| Bottone Accedi/Registrati nav | `6px` |
| Input form | `6px` |
| Card property / agente | `10px` |
| Card tipo | — (nessuno, overflow hidden su contenitore) |
| Card professionista | `12px` |
| Card features dark | `10px` |
| Feature card icon | `10px` |
| Trust icon | `6px` |
| Tag/badge | `20px` (pill) |
| Avatar iniziali | `50%` (circolare) |
| Dropdown menu | `8px` |
| Compare bar | `8px` |
| Conn badge | `8px` |
| Conn badge dot | `50%` |
| Footer social buttons | `6px` |
| Dashboard item attivo | border-left `3px` solid `#26A55B` |

### Max-width container
```css
--max-w: 1200px;  /* applicato a .section-inner, .trust-inner, .hero-search-inner, .footer-inner */
```

### Variabili layout
```css
--nav-h:     72px;
--sidebar-w: 240px;  /* dashboard */
```

---

## 4. NAVBAR

### Struttura
```
[Logo] ←————————— [Nav links centrati (absolute)] —————————→ [🇮🇹 IT | Accedi | Registrati]
```
Logo: a sinistra | Links: `position: absolute; left: 50%; transform: translateX(-50%)` | Buttons: `margin-left: auto`

### Altezza e padding
- Altezza: `min-height: 72px` (var `--nav-h`)
- Padding: `20px 3rem` (desktop), `0 1.5rem` (tablet), `0 1rem` (mobile)
- `position: fixed; top: 0; z-index: 500`
- `transition: background .4s ease, box-shadow .4s ease, backdrop-filter .4s ease`

### Stato TRASPARENTE (su hero)
```css
background: transparent;
/* links */       color: rgba(255,255,255,.88);  hover: color: #fff
/* btn-login */   border-color: rgba(255,255,255,.4); color: rgba(255,255,255,.9)
/* btn-login hover */ border-color: #fff; color: #fff; background: rgba(255,255,255,.1)
/* hamburger */   background: #fff
/* lang */        color: rgba(255,255,255,.8)
/* logo */        .logo-white visible, .logo-dark hidden
```

### Stato SOLID (scroll > 80px)
```css
background: rgba(255,255,255,.97);
box-shadow: 0 1px 0 #D4D4D4;
backdrop-filter: blur(12px);
/* links */       color: #4b5563;  hover: color: #111111
/* btn-login */   border-color: #D4D4D4; color: #111111
/* btn-login hover */ border-color: #26A55B; color: #26A55B
/* hamburger */   background: #111111
/* lang */        color: #4b5563; hover: color: #111111
/* logo */        .logo-dark visible, .logo-white hidden
```

### Trigger scroll
```javascript
if (window.scrollY > 80) → solid
else → transparent
```

### Voci menu
- Font: `1rem`, `font-weight: 500`, `letter-spacing: 0.01em`
- Padding: `.45rem .9rem`, `border-radius: 6px`
- Dropdown arrow: `font-size: 12px` (carattere ▾)

### Bottoni navbar
```css
/* Accedi */
padding: .65rem 1.4rem; border-radius: 6px; border: 1.5px solid; 
background: transparent; font-size: .925rem; font-weight: 500;

/* Registrati */
padding: .65rem 1.5rem; border-radius: 6px; border: none;
background: #26A55B; color: #fff; font-size: .925rem; font-weight: 600;
hover: background: #1d8a4b;
```

### Dropdown "Altro"
```css
background: #fff; border: 1px solid #D4D4D4; border-radius: 8px;
min-width: 160px; box-shadow: 0 8px 24px rgba(0,0,0,.1);
/* item */ font-size: 1rem; font-weight: 500; color: #374151;
```

### Logo heights
| Viewport | Navbar logo | Footer logo | Dashboard logo |
|---|---|---|---|
| Desktop | `90px` | `102px` | `86px` |
| Tablet (≤1024px) | `82px` | `94px` | `78px` |
| Mobile (≤640px) | `74px` | `76px` | — |

### Mobile menu
- `position: fixed; top: 72px; background: #fff; border-bottom: 1px solid #D4D4D4; z-index: 499`
- Link: `padding: .7rem 1rem; border-radius: 6px; font-size: .9rem; font-weight: 500; color: #4b5563`

---

## 5. FOOTER

### Background e padding
```css
background: #CACACA;
padding: 3rem 3rem 1.5rem;   /* desktop */
padding: 0.75rem 1rem 2.5rem; /* mobile ≤640px */
```

### Layout
- 4 colonne: `grid-template-columns: repeat(4, 1fr)` — gap `3rem`
- Tablet (≤1024px): `grid-template-columns: 1fr 1fr` — gap `2rem`
- Mobile (≤640px): `grid-template-columns: 1fr` — gap `2rem` (ridotto a `.75rem` su footer-top)

### Colonne contenuto
1. **Brand**: logo (102px) + descrizione + social icons + impostazioni (lingua/valuta/unità)
2. **Tipologie**: Ville | Agriturismi | Casali | Aziende Agricole | Terreni
3. **LandRetrieve.com**: Agenzie | Agenti | Piani | Chi Siamo | Contatti | FAQ
4. **Legale**: Privacy Policy | Cookie Policy | Termini & Condizioni | T&C d'acquisto

### Footer col header
```css
font-size: .72rem; font-weight: 700; letter-spacing: .1em; 
text-transform: uppercase; color: #1a1a1a; margin-bottom: 1rem;
```

### Footer link
```css
font-size: .875rem; color: #3a3a3a;
hover: color: #26A55B;
margin-bottom: .5rem;
```

### Footer brand text
```css
font-size: .875rem; color: #3a3a3a;
```

### Separator footer-top / footer-bottom
```css
border-bottom: 1px solid rgba(0,0,0,.12);
padding-bottom: 2.5rem;
```

### Footer bottom bar
```css
padding-top: 1.25rem;
display: flex; align-items: center; justify-content: space-between;
/* left */  font-size: .78rem; color: #5a5a5a;
/* links */ font-size: .75rem; color: #5a5a5a; hover: #26A55B; gap: 1.25rem;
```

### Copyright
```
© 2025 - SB.LAND - P.Iva 07385730481 | Tutti i diritti riservati.
```

### Social buttons
```css
width: 32px; height: 32px; border-radius: 6px;
border: 1px solid rgba(0,0,0,.15); background: rgba(255,255,255,.5);
font-size: .78rem; font-weight: 700; color: #3a3a3a;
hover: opacity: .85; transform: scale(1.05);
/* Facebook  */ background: #1877F2; border-color: #1877F2; color: white (SVG)
/* Instagram */ background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)
/* LinkedIn  */ background: #0A66C2; border-color: #0A66C2; color: white (SVG)
```

### Selettori lingua/valuta/unità
```css
border: 1px solid rgba(0,0,0,.15); border-radius: 4px;
padding: .3rem .6rem; font-size: .75rem;
background: rgba(255,255,255,.5); color: #3a3a3a;
appearance: none;
```

---

## 6. COMPONENTI CHIAVE

### 6.1 Card Tipologia (Ville, Agriturismi, Casali…)
```css
/* Contenitore */
position: relative; overflow: hidden; border-radius: 0; cursor: pointer;
aspect-ratio: 3/4;  /* portrait */
/* tipologie-grid */
display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem;

/* Immagine bg */
width: 100%; height: 100%; object-fit: cover;
/* oppure gradient placeholder: linear-gradient(135deg, #1a3a2a, #2d5a3d) */

/* Overlay */
background: linear-gradient(to top, rgba(0,0,0,.65) 0%, rgba(0,0,0,.05) 60%);

/* Contenuto (bottom) */
position: absolute; bottom: 0; left: 0; right: 0; padding: 1.25rem 1rem; color: #fff;

/* Titolo */
font-size: 1rem; font-weight: 600; color: #ffffff; margin-bottom: .25rem;

/* Freccia */
width: 32px; height: 32px; border-radius: 50%;
background: rgba(255,255,255,.2); font-size: .75rem; color: #fff;
```

### 6.2 Card Professionista (Agenzia / Agente)
```css
/* Contenitore */
border-radius: 12px; overflow: hidden; 
box-shadow: 0 16px 48px rgba(0,0,0,.12);

/* Immagine */
aspect-ratio: 16/9; object-fit: cover; width: 100%;
/* overlay */ background: linear-gradient(to top, rgba(0,0,0,.6), transparent);

/* Body */
background: #fff; border: 1px solid #D4D4D4; border-top: none;
padding: 1.5rem; border-radius: 0 0 12px 12px;

/* Tag */
font-size: .68rem; font-weight: 700; text-transform: uppercase;
color: #26A55B; background: #e8f7ef; padding: 3px 10px;
border-radius: 20px; margin-bottom: .75rem; display: inline-block;

/* Titolo */
font-size: 1.1rem; font-weight: 600; margin-bottom: .5rem;

/* Testo */
font-size: .9rem; color: #374151; line-height: 1.6; margin-bottom: 1.25rem;

/* CTA */
padding: .55rem 1.25rem; border-radius: 6px;
border: 1.5px solid #D4D4D4; background: #fff;
font-size: .82rem; font-weight: 600; color: #111111;
hover: border-color: #26A55B; color: #26A55B;
```

### 6.3 Card Feature (4 colonne — "Cosa può fare")
```css
/* Grid */
display: grid; grid-template-columns: repeat(4, 1fr);
gap: 1px; background: #D4D4D4;  /* gap diventa bordo */

/* Card */
background: #fff; padding: 2.25rem 1.75rem;

/* Icona */
width: 48px; height: 48px; border-radius: 10px;
background: #e8f7ef; font-size: 1.3rem;
margin-bottom: 1.25rem;
transition: background .2s, transform .2s;
hover: background: #26A55B; transform: scale(1.1);

/* Titolo */
font-size: 1rem; font-weight: 600; margin-bottom: .5rem;

/* Testo */
font-size: .875rem; color: #4b5563; line-height: 1.6;
```

### 6.4 Card Regione (sezione internazionale, sfondo scuro)
```css
background: rgba(255,255,255,.06);
border: 1px solid rgba(255,255,255,.1);
border-radius: 10px; padding: 1.25rem 1.5rem;
display: flex; align-items: center; gap: 1rem;
transition: all .2s;
hover: background: rgba(255,255,255,.1); border-color: rgba(38,165,91,.3);

/* Icona */
width: 40px; height: 40px; border-radius: 8px;
background: rgba(38,165,91,.2); font-size: 1.1rem;

/* Titolo */
font-size: .88rem; font-weight: 600; color: #fff;

/* Subtitolo */
font-size: .75rem; color: rgba(255,255,255,.55);
```

### 6.5 Card Immobile (property card — da Master Context)
```css
border-radius: 10px; border: 1px solid #D4D4D4;
hover: box-shadow: 0 8px 24px rgba(0,0,0,.1); transform: translateY(-4px);
/* Immagine */
aspect-ratio: 4/3; overflow: hidden;
/* overlay tag: Hot/Nuovo/Vendita */
/* Bottoni: salva + confronta sull'immagine */
```

### 6.6 Card Agente/Agenzia (archivio)
```css
border-radius: 10px; padding: 1.25rem;
/* Avatar circolare con iniziali */
background: #26A55B; color: #fff; border-radius: 50%;
/* Badge ✅ Verificato */
background: #e8f7ef; color: #26A55B;
```

### 6.7 Bottoni
```css
/* PRIMARY (verde) */
padding: .9rem 2rem; border-radius: 6px;
background: #26A55B; color: #fff; border: none;
font-size: .95rem; font-weight: 600;
hover: background: #1d8a4b;
/* MAI box-shadow o transform */

/* OUTLINE (bordo grigio) */
padding: .9rem 2rem; border-radius: 6px;
border: 1.5px solid #D4D4D4; background: #fff;
font-size: .95rem; font-weight: 500; color: #111111;
hover: border-color: #26A55B; color: #26A55B;

/* OUTLINE BIANCO (su dark/hero) */
border: 1.5px solid rgba(255,255,255,.5); background: transparent; color: #fff;
hover: border-color: #fff; background: rgba(255,255,255,.1);

/* GHOST / Nav btn */
background: transparent; no border (o 1.5px solid per login);
font-size: .925rem; font-weight: 500;

/* Dimensioni varianti */
/* Small (prof, tag) */ padding: .55rem 1.25rem; font-size: .82rem;
/* Medium (nav)      */ padding: .65rem 1.4rem; font-size: .925rem;
/* Standard          */ padding: .9rem 2rem; font-size: .95rem;
/* Search            */ padding: .65rem 1.75rem; font-size: .9rem; font-weight: 700;
```

### 6.8 Form Inputs
```css
/* Input / Select */
width: 100%; border: 1.5px solid #D4D4D4; border-radius: 6px;
padding: .6rem .85rem; font-size: .88rem; color: #111111;
background: #fff; transition: border-color .15s;
focus: border-color: #26A55B; background: #fff;

/* Label */
font-size: .78rem; font-weight: 700; text-transform: uppercase;
letter-spacing: .06em; color: #4b5563; margin-bottom: .3rem;

/* Textarea */
stesse regole di input, resize: vertical;
```

### 6.9 Badge e Tag
```css
/* Tag tipologia (card) */
font-size: .68rem; font-weight: 700; text-transform: uppercase;
color: #26A55B; background: #e8f7ef; padding: 3px 10px;
border-radius: 20px; display: inline-block;

/* Badge verificato */
background: #e8f7ef; color: #26A55B; font-weight: 600;
border-radius: 20px; padding: 2px 8px; font-size: .75rem;

/* Label overlay (Hot/Nuovo) */
/* colori specifici da definire per ogni tipo */
```

### 6.10 Sezione con Eyebrow
```css
/* Eyebrow */
.section-eyebrow {
  font-size: .72rem; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: #1a7a42;
  margin-bottom: .75rem;
  display: flex; align-items: center; gap: 10px;
}
.section-eyebrow::after {
  content: ''; flex: 1; height: 1px; background: #D4D4D4;
}

/* Section title */
font-size: clamp(1.75rem, 3vw, 2.4rem); font-weight: 600;
line-height: 1.15; margin-bottom: 1rem; max-width: 580px;

/* Section subtitle */
font-size: 1rem; color: #374151; line-height: 1.7; max-width: 520px;

/* Section header margin */
margin-bottom: 3.5rem;
```

### 6.11 Hero Section
```css
/* Contenitore */
position: relative; height: 100vh; min-height: 600px;
display: flex; flex-direction: column;
align-items: center; justify-content: center; overflow: hidden;

/* Background + overlay */
.hero-bg { position: absolute; inset: 0; }
.hero-bg::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,.35) 0%, rgba(0,0,0,.5) 100%);
}

/* Content */
position: relative; z-index: 2; text-align: center;
padding: 0 1.5rem; max-width: 820px;

/* Eyebrow hero */
font-size: .75rem; font-weight: 600; letter-spacing: .14em;
text-transform: uppercase; color: rgba(255,255,255,.7);
margin-bottom: 1.5rem;
/* ::before e ::after */ content: ''; width: 20px; height: 1px;
background: rgba(255,255,255,.4);

/* H1 */
font-size: clamp(3rem, 7vw, 5.5rem); font-weight: 700;
color: #fff; line-height: 1.2; margin-bottom: 1.25rem;
/* em */ font-style: italic; font-weight: 300; color: rgba(255,255,255,.85);

/* Subtitle */
font-size: 1.05rem; font-weight: 300;
color: rgba(255,255,255,.96); margin-bottom: 2.5rem;

/* Scroll hint */
position: absolute; bottom: 2rem; font-size: .68rem;
font-weight: 600; letter-spacing: .1em; color: rgba(255,255,255,.5);
text-transform: uppercase;
/* Arrow */ width: 20px; height: 20px; border-right: 2px solid rgba(255,255,255,.4);
border-bottom: 2px solid rgba(255,255,255,.4); transform: rotate(45deg);
```

### 6.12 Trust Bar
```css
background: #f5f5f5;
border-top: 1px solid #D4D4D4; border-bottom: 1px solid #D4D4D4;
padding: 1.25rem 3rem;
/* inner */ display: flex; align-items: center; justify-content: center;
gap: 3rem; flex-wrap: wrap;
/* item */ display: flex; align-items: center; gap: .5rem;
font-size: .82rem; font-weight: 500; color: #4b5563;
/* icon */ width: 28px; height: 28px; border-radius: 6px;
background: #e8f7ef; font-size: .9rem; flex-shrink: 0;
```

### 6.13 Compare Bar (floating)
```css
position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
z-index: 400; background: #1a1a1a; color: #fff; border-radius: 8px;
padding: .7rem 1.25rem; display: flex; align-items: center; gap: .75rem;
font-size: .82rem; font-weight: 500;
box-shadow: 0 8px 24px rgba(0,0,0,.25);
/* visibile solo con immobili in confronto */
opacity: 0; pointer-events: none; transition: opacity .3s;
```

### 6.14 Dashboard Layout
```css
/* Sidebar */
width: 240px; background: #CACACA; position: fixed;
height: 100vh; overflow-y: auto;
/* Item attivo */
border-left: 3px solid #26A55B;
background: rgba(38,165,91,0.12); color: #1a7a42;
/* Label sezione */
font-size: .65rem; font-weight: 700; letter-spacing: .1em;
text-transform: uppercase; color: #5a5a5a; padding: 1.25rem 1rem .4rem;

/* Topbar */
position: fixed; top: 0; right: 0; left: 240px;
height: 72px; background: #fff; border-bottom: 1px solid #D4D4D4; z-index: 100;

/* Main content */
margin-left: 240px; padding-top: 72px;
background: #f5f5f5; min-height: 100vh;
/* Inner padding */ padding: 2rem;
```

---

## 7. ANIMAZIONI E TRANSIZIONI

### Durate
| Proprietà | Durata | Easing |
|---|---|---|
| Navbar background/shadow/backdrop | `0.4s` | `ease` |
| Tutti i bottoni (color, bg, border) | `0.2s` | default |
| Nav link hover | `0.2s` | default |
| Logo opacity | `0.2s` | default |
| Input border-color | `0.15s` | default |
| Footer link color | `0.15s` | default |
| Social btn hover | `0.15s` | default |
| Feature icon (bg + scale) | `0.2s` | default |
| Card intl hover | `0.2s` | default |
| Compare bar opacity | `0.3s` | default |
| Dropdown arrow rotate | incluso in `transition` dropdown |
| Mobile menu toggle | immediato (toggle class) |
| Hamburger spans | `0.3s` | default |

### Scroll Reveal
```javascript
IntersectionObserver({
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
})
// Classe .reveal → .visible quando in viewport
// Animazione: opacity 0→1 + translateY(20px→0) (da aggiungere nel CSS)
```

### Regola anti-shadow su bottoni
- **NESSUN** `box-shadow` sui bottoni
- **NESSUN** `transform: translateY` / `scale` sui bottoni (eccetto icone interne)
- Solo cambio `background` e/o `border-color` e/o `color`

---

## 8. RESPONSIVE BREAKPOINTS

### Valori esatti
```css
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 640px)  { /* Mobile */ }
```

### Comportamenti per breakpoint

#### ≤ 1024px (Tablet)
- Navbar: nav-links nascosti → hamburger visibile
- Sezioni: `padding: 4rem 1.5rem`
- Hero search: `padding: 0 1.5rem 2rem`; search fields: `grid-template-columns: 1fr 1fr`
- Tipologie grid: `grid-template-columns: repeat(3, 1fr)`
- Connessioni/Professionisti/Internazionale: `grid-template-columns: 1fr` (stack verticale)
- Features grid: `grid-template-columns: repeat(2, 1fr)`
- Footer top: `grid-template-columns: 1fr 1fr; gap: 2rem`
- Trust: `gap: 1.5rem`

#### ≤ 640px (Mobile)
- Navbar: `padding: 0 1rem`; btn-login e btn-reg nascosti (solo hamburger)
- Hero: H1 `font-size: 2.5rem`; content `padding: 0 1rem`
- Sezioni: `padding: 3rem 1rem`
- Tipologie grid: `grid-template-columns: repeat(2, 1fr)`
- Intl stats: `grid-template-columns: 1fr`
- Features grid: `grid-template-columns: 1fr`
- Footer top: `grid-template-columns: 1fr; gap: 2rem`; mobile `gap: .75rem; padding-bottom: .75rem`
- Footer bottom: `flex-direction: column; align-items: flex-start; padding-top: .5rem`
- CTA band: `padding: 3rem 1rem`

---

## 9. SHADOW SYSTEM

```css
/* Card professionista */
box-shadow: 0 16px 48px rgba(0,0,0,.12);

/* Compare bar */
box-shadow: 0 8px 24px rgba(0,0,0,.25);

/* Dropdown menu */
box-shadow: 0 8px 24px rgba(0,0,0,.1);

/* Conn badge */
box-shadow: 0 4px 16px rgba(0,0,0,.1);

/* Hero search bar */
box-shadow: 0 4px 20px rgba(0,0,0,.06);

/* Navbar solid */
box-shadow: 0 1px 0 #D4D4D4;

/* NESSUN shadow su bottoni */
```

---

## 10. ICONE E ASSET

### Logo
- 2 versioni: **dark** (su sfondo bianco/navbar solid) e **white** (su hero/sfondo scuro)
- Switch automatico CSS: `.navbar.transparent .logo-dark { display:none }` / `.navbar.transparent .logo-white { display:block }`
- Formato: SVG (da `wp-content/uploads/2024/10/Logo-500x500-1.svg`)

### Icone UI
- Tutti gli emoji Unicode usati come icone (trust bar, features, sidebar dashboard)
- SVG inline per social (Facebook, Instagram, LinkedIn)
- No icon library esterna nella landing — nella webapp usare `lucide-react` (già incluso con shadcn/ui)

---

## 11. NOTE IMPLEMENTATIVE

1. **Inter font**: preconnect a `fonts.googleapis.com` e `fonts.gstatic.com`, poi load `Inter:wght@300;400;500;600;700`
2. **No Toscana nel testo pubblico** — mai menzionare esplicitamente la regione nelle UI pubbliche
3. **Piattaforma internazionale** — copy sempre in ottica globale
4. **Profili visitatori non pubblici** — solo agenti e agenzie hanno profilo pubblico
5. **ID immobile formato**: `LR` + 5 cifre (es. `LR00042`)
6. **Scroll reveal**: ogni sezione ha classe `.reveal` che riceve `.visible` al 12% di visibilità
7. **Navbar trigger**: a `window.scrollY > 80` cambia da transparent a solid
8. **Compare bar**: appare quando ≥ 1 immobile aggiunto al confronto, max 3
