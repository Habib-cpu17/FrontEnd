import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const readStoredTheme = () => {
    // Storage can throw outright (blocked cookies, some private-mode setups).
    // Falling back to the OS preference is better than a blank screen.
    try {
        const stored = localStorage.getItem("theme");
        if (stored === "light" || stored === "dark") return stored;
    } catch {
        /* ignore and fall through to the media query */
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(readStoredTheme);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
        try {
            localStorage.setItem("theme", theme);
        } catch {
            /* not persistable — the in-memory theme still applies */
        }
        // The <meta name="theme-color"> tags are scoped to the OS preference, so
        // they go stale the moment someone overrides it with the toggle.
        const color = theme === "dark" ? "#0d0520" : "#f7f4fb";
        document
            .querySelectorAll('meta[name="theme-color"]')
            .forEach((m) => m.setAttribute("content", color));
    }, [theme]);

    const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
    return ctx;
}