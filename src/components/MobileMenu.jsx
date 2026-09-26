import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

/* The panel is position:fixed directly under the header, which is h-16 on
   mobile (the desktop link row is md:block, so it is the only row there). */
const PANEL_TOP = "top-16";

const itemClass = ({ isActive }) =>
    `relative flex items-center gap-3 min-h-[52px] px-4 text-[13px] font-medium uppercase tracking-wide border-b border-token transition-colors ${
        isActive
            ? // `.bg-pink` is a hand-written class in index.css, not a Tailwind
              // utility, so the before: variant has to reach the token directly.
              "text-body bg-page-2 before:absolute before:start-0 before:top-0 before:h-full before:w-[3px] before:bg-[color:var(--pink)]"
            : "text-dim hover:text-body hover:bg-page-2"
    }`;

export function MobileMenuButton({ open, onToggle, controls }) {
    const { t } = useLang();
    return (
        <button
            type="button"
            data-shape="rounded"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={controls}
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            className="md:hidden w-9 h-9 grid place-items-center transition border border-token hover:border-[color:var(--purple)] text-body"
        >
            {open ? (
                <svg
                    key="x"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="icon-swap"
                >
                    <path d="M18 6 6 18M6 6l12 12" />
                </svg>
            ) : (
                <svg
                    key="bars"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="icon-swap"
                >
                    <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
            )}
        </button>
    );
}

export default function MobileMenu({ open, onClose, links, children }) {
    const { t } = useLang();
    const panelRef = useRef(null);
    const restoreToRef = useRef(null);

    // Escape closes, Tab is trapped inside the panel while it is open.
    useEffect(() => {
        if (!open) return undefined;

        const focusables = () =>
            Array.from(
                panelRef.current?.querySelectorAll("a[href], button:not([disabled])") ?? []
            );

        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
                return;
            }
            if (e.key !== "Tab") return;

            const nodes = focusables();
            if (!nodes.length) return;
            const first = nodes[0];
            const last = nodes[nodes.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    // Lock the page behind the panel, move focus in, and hand it back on close.
    useEffect(() => {
        if (!open) return undefined;

        restoreToRef.current = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const first = panelRef.current?.querySelector("a[href], button:not([disabled])");
        first?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            if (restoreToRef.current instanceof HTMLElement) restoreToRef.current.focus();
        };
    }, [open]);

    if (!open) return null;

    return (
        <>
            <div
                className={`fixed left-0 right-0 bottom-0 ${PANEL_TOP} z-30 bg-black/50 overlay-in md:hidden`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                id="mobile-menu"
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={t("nav.menu")}
                className={`fixed inset-x-0 ${PANEL_TOP} z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-token shadow-2xl menu-in md:hidden`}
                style={{ background: "var(--surface)" }}
            >
                <nav className="flex flex-col" aria-label={t("nav.menu")}>
                    {links.map((l) => (
                        <NavLink key={l.to} to={l.to} className={itemClass} onClick={onClose}>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>
                {children ? (
                    <div className="p-4 flex flex-col gap-2">{children}</div>
                ) : null}
            </div>
        </>
    );
}
