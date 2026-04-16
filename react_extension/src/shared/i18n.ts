/// <reference types="vite/client" />

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

export const supportedLanguages = ["en", "de"];

// Use a cast to any for import.meta to avoid type errors when vite types are not loaded
const buildHash = (import.meta as any).env?.VITE_BUILD_HASH ?? "";

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
    debug: (import.meta as any).env?.MODE !== "production",
    fallbackLng: "de",
    supportedLngs: supportedLanguages,
    backend: {
      loadPath:
        (import.meta as any).env?.MODE === "production"
          ? `/locales/{{lng}}/translation.json?v=${buildHash}`
          : "/locales/{{lng}}/translation.json",
    },
  });
export default i18n;
