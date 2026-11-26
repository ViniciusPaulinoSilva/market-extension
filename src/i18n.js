// Idioma da interface: português (pt) se o Chrome estiver em português, inglês (en) em qualquer outro caso.
// O idioma não muda enquanto a extensão está aberta, então L() pode ser usado em constantes de módulo.
function detect() {
  try {
    if (globalThis.__LANG__) return String(globalThis.__LANG__);
    const inExtension = typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage;
    // Fora da extensão (prévia no navegador e capturas) dá para forçar o idioma com localStorage.lang.
    if (!inExtension && typeof localStorage !== 'undefined') {
      const forced = localStorage.getItem('lang');
      if (forced) return forced;
    }
    if (inExtension) return chrome.i18n.getUILanguage();
    if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
  } catch {
    /* storage bloqueado: cai no inglês */
  }
  return 'en';
}

export const LANG = /^pt/i.test(detect()) ? 'pt' : 'en';
export const LOCALE = LANG === 'pt' ? 'pt-BR' : 'en-US';

/** Escolhe o texto no idioma atual. */
export const L = (en, pt) => (LANG === 'pt' ? pt : en);
