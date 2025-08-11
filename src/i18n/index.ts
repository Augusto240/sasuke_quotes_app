import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import pt from './locales/pt.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

const i18n = new I18n({
  pt,
  en,
  ja,
});

i18n.locale = Localization.getLocales()[0].languageTag;
i18n.enableFallback = true;
i18n.defaultLocale = 'pt';

export default i18n;

export const setLanguage = (language: string) => {
  i18n.locale = language;
};

export const getCurrentLanguage = () => i18n.locale.split('-')[0];