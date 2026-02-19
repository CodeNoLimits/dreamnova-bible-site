# DreamNova i18n System

5-language internationalization: FR (default) · EN · HE (RTL) · ES · RU

## Files

| File | Purpose |
|------|---------|
| `fr.json` | French — reference/default |
| `en.json` | English |
| `he.json` | Hebrew (RTL) |
| `es.json` | Spanish |
| `ru.json` | Russian |
| `i18n.js` | Engine — load/switch/cache translations |
| `lang-selector.html` | Drop-in HTML+CSS snippet for nav |

---

## Integration (2 steps)

### Step 1 — Load the engine in `<head>`

```html
<script src="/lang/i18n.js" defer></script>
```

### Step 2 — Tag elements with `data-i18n`

```html
<!-- Text content -->
<h1 data-i18n="hero_headline">L'Agence IA qui Livre</h1>
<p  data-i18n="hero_subheadline">Sites, SaaS, Apps...</p>
<a  data-i18n="hero_cta">Obtenir un devis gratuit</a>

<!-- Input placeholders -->
<input data-i18n-placeholder="contact_title" placeholder="Parlons de votre projet">
```

The engine replaces `el.textContent` for `data-i18n` and `el.placeholder` for `data-i18n-placeholder`.

### Step 3 — Add the language selector

Copy the snippet from `lang-selector.html` into your `<nav>`. The `<select>` calls `I18N.setLang(value)` on change and is automatically kept in sync on page load.

---

## RTL support

When Hebrew (`he`) is selected, the engine sets:
```
document.documentElement.dir = 'rtl'
document.documentElement.lang = 'he'
```

Ensure your CSS handles RTL layout (use logical properties: `margin-inline-start` instead of `margin-left`, etc.).

---

## Adding a new language

1. Create `lang/XX.json` with all 32 keys (copy `fr.json` as template).
2. Add an `<option value="XX">🏳️ XX</option>` to the selector in `lang-selector.html`.
3. Done — the engine auto-loads the file on first use and caches it.

---

## Keys reference

```
nav_hub · nav_portfolio · nav_tarifs · nav_devis
hero_headline · hero_subheadline · hero_cta
hero_stat1 · hero_stat2 · hero_stat3
services_title · services_subtitle
service1_title · service1_desc
service2_title · service2_desc
service3_title · service3_desc
service4_title · service4_desc
portfolio_title · portfolio_link
testimonials_title
pricing_title · pricing_cta
contact_title · contact_cta
footer_tagline
lang_selector_label
devis_title · devis_subtitle
```

---

## Events

Listen for language changes anywhere in your page JS:

```javascript
document.addEventListener('langChanged', ({ detail }) => {
  console.log(detail.lang);          // 'he'
  console.log(detail.translations);  // full JSON object
});
```

---

## Persistence

Selected language is stored in `localStorage` under key `dn_lang`. Survives page refresh and navigation across all site pages.
