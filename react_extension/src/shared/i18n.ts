import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

export const supportedLanguages = ["en", "de"];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    debug: process.env.NODE_ENV !== "production",
    fallbackLng: "en",
    supportedLngs: supportedLanguages,
    backend: {
      loadPath:
        process.env.NODE_ENV === "production"
          ? `/ext/locales/{{lng}}/translation.json?v=${__BUILD_HASH__}`
          : "/ext/locales/{{lng}}/translation.json",
    },
  });
export default i18n;
