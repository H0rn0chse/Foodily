import { createI18n } from "vue-i18n";
// User defined lang
import enLocale from "./en.json";

const messages = {
  en: {
    ...enLocale
  }
};

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
  messages
});

// export default i18n
export default i18n;
