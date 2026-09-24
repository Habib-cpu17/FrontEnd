import { useLang } from "../context/LanguageContext";

export default function LanguageToggle({ className = "" }) {
    const { lang, toggle } = useLang();

    return (
        <button
            type="button"
            data-shape="rounded"
            onClick={toggle}
            aria-label={lang === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
            className={`relative w-9 h-9 grid place-items-center transition border border-token hover:border-[color:var(--purple)] font-display font-bold text-[10px] ${className}`}
        >
            {lang === "en" ? "AR" : "EN"}
        </button>
    );
}