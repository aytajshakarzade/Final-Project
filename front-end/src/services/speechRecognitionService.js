export const getSpeechRecognitionConstructor = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;
export const speechLanguageFor = (language) => ({ az: 'az-AZ', en: 'en-US', ru: 'ru-RU' }[language] || 'en-US');
