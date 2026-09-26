import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useMe } from "../hooks/useMe";
import { toAbsoluteUrl } from "../services/uploadService";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import SearchBar from "./SearchBar";
import MobileMenu, { MobileMenuButton } from "./MobileMenu";

const linkClass = ({ isActive }) =>
    `px-3 py-2 text-[13px] font-medium uppercase tracking-wide transition ${
        isActive ? "text-body" : "text-dim hover:text-body"
    }`;

export default function Navbar() {
    const { firebaseUser, logout } = useAuth();
    const { t } = useLang();
    const { me } = useMe();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [lastPath, setLastPath] = useState(location.pathname);

    // Close the panel on navigation. Adjusting during render (React's documented
    // pattern for state derived from props) avoids the frame where the panel is
    // still open on the new route, which an effect would leave behind.
    if (lastPath !== location.pathname) {
        setLastPath(location.pathname);
        setMenuOpen(false);
    }

    // Hide the navbar search on /components — that page has its own search
    const hideSearch = location.pathname.startsWith("/components");

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    const onLogout = async () => {
        closeMenu();
        await logout();
        navigate("/");
    };

    const initial = (me?.displayName || firebaseUser?.email || "?")
        .charAt(0)
        .toUpperCase();

    const links = [
        { to: "/components", label: t("nav.components") },
        { to: "/builder", label: t("nav.builder") },
        { to: "/my-builds", label: t("nav.myBuilds") },
        { to: "/public-builds", label: t("nav.community") },
        ...(firebaseUser ? [{ to: "/profile", label: t("nav.profile") }] : []),
        ...(me?.role === "ADMIN" ? [{ to: "/admin", label: t("nav.admin") }] : []),
    ];

    return (
        <>
        <header
            className={`sticky top-0 z-40 transition-all duration-300 border-b ${
                scrolled ? "backdrop-blur-xl border-token" : "border-transparent"
            }`}
            style={{
                background: scrolled
                    ? "color-mix(in srgb, var(--bg) 85%, transparent)"
                    : "transparent",
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 shrink-0">
                    <div className="w-9 h-9 grid place-items-center gradient-brand shadow-lg">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                            <rect x="9" y="9" width="6" height="6" />
                            <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
                        </svg>
                    </div>
                    <span className="font-display font-bold tracking-tight text-[16px] hidden sm:inline">
            {t("nav.brand")}
          </span>
                </Link>

                {!hideSearch && <SearchBar className="hidden lg:flex" />}

                <div className="ms-auto flex items-center gap-2">
                    <LanguageToggle />
                    <ThemeToggle />
                    {firebaseUser ? (
                        <>
                            <Link
                                to="/profile"
                                className="hidden sm:flex items-center gap-2 text-[12.5px] text-dim hover:text-body transition"
                                title={t("nav.viewProfile")}
                            >
                <span
                    className="w-7 h-7 shrink-0 grid place-items-center text-white font-display font-bold text-[11.5px] overflow-hidden"
                    style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}
                >
                  {me?.avatarUrl ? (
                      <img
                          src={toAbsoluteUrl(me.avatarUrl)}
                          alt=""
                          width={28}
                          height={28}
                          decoding="async"
                          className="w-full h-full object-cover"
                      />
                  ) : (
                      initial
                  )}
                </span>
                                <span className="truncate max-w-[120px]">
                  {me?.displayName || firebaseUser.email}
                </span>
                            </Link>
                            <button
                                onClick={onLogout}
                                className="hidden sm:block text-[12.5px] text-dim hover:text-pink transition px-2"
                            >
                                {t("nav.logOut")}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="hidden sm:inline text-[13px] text-dim hover:text-body transition px-3"
                            >
                                {t("nav.signIn")}
                            </Link>
                            <Link to="/register" className="btn-yellow !py-2 !px-4 !text-[13px]">
                                {t("nav.getStarted")}
                            </Link>
                        </>
                    )}
                    <MobileMenuButton
                        open={menuOpen}
                        onToggle={toggleMenu}
                        controls="mobile-menu"
                    />
                </div>
            </div>

            <div className="hidden md:block border-t border-token">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-11 flex items-center gap-1">
                    {links.map((l) => (
                        <NavLink key={l.to} to={l.to} className={linkClass}>
                            {l.label}
                        </NavLink>
                    ))}
                    <span className="ms-auto text-[12px] text-dim">{t("nav.tagline")}</span>
                </div>
            </div>
        </header>

        <MobileMenu open={menuOpen} onClose={closeMenu} links={links}>
            {firebaseUser ? (
                <button
                    onClick={onLogout}
                    className="w-full py-3 text-[13px] font-medium uppercase tracking-wide border border-token text-dim hover:text-pink transition"
                >
                    {t("nav.logOut")}
                </button>
            ) : (
                <Link to="/login" className="btn-secondary justify-center">
                    {t("nav.signIn")}
                </Link>
            )}
        </MobileMenu>
        </>
    );
}