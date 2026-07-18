export const translate = (translations, language, key) => translations[language]?.[key] || translations.en?.[key] || key;
export function applyDomTranslations(translations, language) {
  document.querySelectorAll('[data-key]').forEach((node) => {
    const value = translate(translations, language, node.dataset.key);
    if (value) node.textContent = value;
  });
}
