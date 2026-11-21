import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { detectLanguage, isSupportedLanguage, persistLanguage } from './language';

import commonFr from './fr/common.json';
import playerFr from './fr/player.json';
import caesarFr from './fr/caesar.json';
import substitutionFr from './fr/substitution.json';
import permutationFr from './fr/permutation.json';
import vigenereFr from './fr/vigenere.json';

import commonEn from './en/common.json';
import playerEn from './en/player.json';
import caesarEn from './en/caesar.json';
import substitutionEn from './en/substitution.json';
import permutationEn from './en/permutation.json';
import vigenereEn from './en/vigenere.json';

const frResources = {
  ...commonFr,
  ...playerFr,
  ...caesarFr,
  ...substitutionFr,
  ...permutationFr,
  ...vigenereFr,
};

const enResources = {
  ...commonEn,
  ...playerEn,
  ...caesarEn,
  ...substitutionEn,
  ...permutationEn,
  ...vigenereEn,
};

const initialLang = detectLanguage();

void i18n.use(initReactI18next).init({
  initAsync: false,
  lng: initialLang,
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
  resources: {
    fr: {
      translation: frResources,
    },
    en: {
      translation: enResources,
    },
  },
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || initialLang;
}

i18n.on('languageChanged', (lng: string) => {
  if (isSupportedLanguage(lng)) {
    persistLanguage(lng);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lng;
    }
  }
});

export { i18n };
export default i18n;
