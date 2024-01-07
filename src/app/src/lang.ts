import { watch } from "vue";
import { useI18nConfig } from "vuestic-ui";
import { createI18n, useI18n } from "vue-i18n";
// User defined lang
import enLocale from "@/i18n/en.json";
import deLocale from "@/i18n/de.json";

const messages = {
  en: {
    ...enLocale
  },
  de: {
    ...deLocale
  }
};

export const supportedLanguages = Object.keys(messages);

const getLocale = () => {
  // type UserSettings = {
  //   result: {
  //     language: string
  //   }
  // }
  // fetch("/api/v1/userSettings")
  //   .then<UserSettings>((res) => {
  //     return res.json();
  //   })
  //   .then((res) => {
  //     const { locale } = useI18n();
  //     const storedLocale = res.result.language;
  //     if (storedLocale && supportedLanguages.includes(storedLocale)) {
  //       locale.value = storedLocale;
  //     }
  //   });
    
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
  messages
});

// export default i18n
export default i18n;

export function registerVuesticConfigToLocale () {
  // Update vuestic default message with vue-i18n keys
  type I18nVuesticMessages = {
    "vuestic"?: {
      [key: string]: string,
    }
  }

  const { locale, messages } = useI18n();
  const { mergeIntoConfig } = useI18nConfig();

  const localeMessages: I18nVuesticMessages = messages.value[locale.value] ;
  mergeIntoConfig(localeMessages?.vuestic || {});

  watch(locale, (newLocale: string) => {
    const localeMessages: I18nVuesticMessages = messages.value[newLocale];
    mergeIntoConfig(localeMessages?.vuestic || {});
  });
}
