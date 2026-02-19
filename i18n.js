/**
 * DreamNova i18n — Lightweight Internationalization System
 * Supports: FR (default), EN, HE (RTL), ES, RU
 * No dependencies. Vanilla JS.
 */

const I18N = {
  currentLang: 'fr',
  translations: {},
  supportedLangs: ['fr', 'en', 'he', 'es', 'ru'],
  rtlLangs: ['he'],

  async init() {
    // Check saved preference, then browser language
    const saved = localStorage.getItem('dn-lang');
    const browserLang = navigator.language?.slice(0, 2);
    const detectedLang = saved || (this.supportedLangs.includes(browserLang) ? browserLang : 'fr');
    await this.setLang(detectedLang);
  },

  async setLang(lang) {
    if (!this.supportedLangs.includes(lang)) lang = 'fr';

    try {
      const response = await fetch(`/lang/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}`);
      this.translations = await response.json();
    } catch (err) {
      console.warn(`i18n: Could not load "${lang}", falling back to FR`, err);
      if (lang !== 'fr') {
        try {
          const response = await fetch('lang/fr.json');
          this.translations = await response.json();
          lang = 'fr';
        } catch (e) {
          console.error('i18n: Could not load fallback FR', e);
          return;
        }
      }
      return;
    }

    this.currentLang = lang;
    localStorage.setItem('dn-lang', lang);

    // Apply translations
    this.applyTranslations();

    // Handle RTL/LTR
    if (this.rtlLangs.includes(lang)) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', lang);
      document.body.classList.add('rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang);
      document.body.classList.remove('rtl');
    }

    // Update active state on language selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  },

  applyTranslations() {
    // data-i18n attribute: replaces textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = this.getNestedValue(key);
      if (value) el.textContent = value;
    });

    // data-i18n-placeholder: replaces placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = this.getNestedValue(key);
      if (value) el.setAttribute('placeholder', value);
    });

    // data-i18n-title: replaces title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const value = this.getNestedValue(key);
      if (value) el.setAttribute('title', value);
    });

    // data-i18n-html: replaces innerHTML (use carefully)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const value = this.getNestedValue(key);
      if (value) el.innerHTML = value;
    });
  },

  getNestedValue(key) {
    return key.split('.').reduce((obj, k) => obj?.[k], this.translations);
  },

  t(key) {
    return this.getNestedValue(key) || key;
  }
};

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18N.init());
} else {
  I18N.init();
}
