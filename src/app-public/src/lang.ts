import { createI18n, useI18n } from "vue-i18n";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";
import type { LocaleInstance } from "vuetify";
import * as vuetifyLocale from "vuetify/locale";
// User defined lang
import enLocale from "@/i18n/en.json";
import deLocale from "@/i18n/de.json";

const locales = [
  {
    key: "en",
    ...enLocale,
    $vuetify: {
      ...vuetifyLocale.en
    }
  },
  {
    key: "de",
    ...deLocale,
    $vuetify: {
      ...vuetifyLocale.de
    }
  }
];

const messages = locales.reduce((messages, locale) => {
  messages[locale.key] = locale.messages;
  return messages;
}, {} as Record<string, any>);

const defaultDatetimeFormat = {
  short: {
    year: "numeric",
    month: "short",
    day: "numeric"
  },
  numeric: {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  },
  long: {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric"
  }
};

const datetimeFormats = locales.reduce((datetimeFormats, locale) => {
  datetimeFormats[locale.key] = {
    ...defaultDatetimeFormat,
    ...locale.dateTimeFormat
  };
  return datetimeFormats;
}, {} as Record<string, any>);

const numberFormats = locales.reduce((numberFormats, locale) => {
  numberFormats[locale.key] = locale.numberFormat;
  return numberFormats;
}, {} as Record<string, any>);

export const supportedLanguages = locales.reduce((languages, locale) => {
  languages[locale.key] = locale.name;
  return languages;
}, {} as Record<string, any>);

const getLocale = () => {
  const cookieLanguage = sessionStorage.getItem("language");
  if (cookieLanguage) {
    return cookieLanguage;
  }

  const language = navigator.language.toLowerCase();
  const locales = Object.keys(messages);
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale;
    }
  }

  return "en";
};

const i18n = createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: "en",
  datetimeFormats,
  numberFormats,
  messages
});

// export default i18n
export default i18n;

export const vuetifyLocaleConfig = {
  adapter: createVueI18nAdapter({ i18n, useI18n }) as LocaleInstance
};
