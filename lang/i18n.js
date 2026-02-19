// DreamNova i18n engine — no dependencies
// Supports both underscore keys (nav_hub) and dot keys (nav.center)
const I18N = {
  current: localStorage.getItem('dn_lang') || 'fr',
  cache: {},

  async load(lang) {
    if (this.cache[lang]) return this.cache[lang];
    try {
      const r = await fetch(`/lang/${lang}.json`);
      if (!r.ok) throw new Error(`${r.status}`);
      this.cache[lang] = await r.json();
    } catch(e) {
      console.warn(`[i18n] Failed to load ${lang}.json, falling back to fr`);
      if (lang !== 'fr') return this.load('fr');
      this.cache[lang] = {};
    }
    return this.cache[lang];
  },

  // Resolve key: try exact, then dot→underscore, then nested dot path
  resolve(t, key) {
    if (t[key]) return t[key];
    const under = key.replace(/\./g, '_');
    if (t[under]) return t[under];
    // Try nested dot path: "nav.center" → t.nav.center
    const parts = key.split('.');
    let val = t;
    for (const p of parts) { val = val?.[p]; }
    return val || null;
  },

  async setLang(lang) {
    this.current = lang;
    localStorage.setItem('dn_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'he') ? 'rtl' : 'ltr';
    const t = await this.load(lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = this.resolve(t, el.getAttribute('data-i18n'));
      if (val) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const val = this.resolve(t, el.getAttribute('data-i18n-html'));
      if (val) el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const val = this.resolve(t, el.getAttribute('data-i18n-placeholder'));
      if (val) el.placeholder = val;
    });

    // Update active state on lang buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    // Update select if present
    const sel = document.getElementById('lang-select');
    if (sel) sel.value = lang;

    document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang, translations: t } }));
  },

  async init() {
    await this.setLang(this.current);
  }
};

document.addEventListener('DOMContentLoaded', () => I18N.init());
