import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LANGUAGE_KEY, SUPPORTED_LANGS, translate, formatNumber, formatDate } from "../lib/i18n";

const LanguageContext = createContext(null);

function detectInitial() {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (SUPPORTED_LANGS.includes(stored)) return stored;
    return (navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(detectInitial);

    useEffect(() => {
        const root = document.documentElement;
        root.lang = lang;
        root.dir = lang === "ar" ? "rtl" : "ltr";
        localStorage.setItem(LANGUAGE_KEY, lang);
    }, [lang]);

    const toggle = useCallback(() => {
        setLang((l) => (l === "ar" ? "en" : "ar"));
    }, []);

    const t = useCallback((key, params) => translate(lang, key, params), [lang]);
    const n = useCallback((value) => formatNumber(lang, value), [lang]);
    const d = useCallback((value) => formatDate(lang, value), [lang]);

    return (
        <LanguageContext.Provider
            value={{ lang, setLang, toggle, t, n, d, dir: lang === "ar" ? "rtl" : "ltr" }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLang() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
    return ctx;
}