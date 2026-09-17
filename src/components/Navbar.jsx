import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMe } from "../hooks/useMe";
import { toAbsoluteUrl } from "../services/uploadService";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";

const linkClass = ({ isActive }) =>
    `px-3 py-2 text-[13px] font-medium uppercase tracking-wide transition ${
        isActive ? "text-body" : "text-dim hover:text-body"
    }`;

export default function Navbar() {
    const { firebaseUser, logout } = useAuth();
    const { me } = useMe();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // Hide the navbar search on /components — that page has its own search
    const hideSearch = location.pathname.startsWith("/components");

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const onLogout = async () => {
        await logout();
        navigate("/");
    };

    const initial = (me?.displayName || firebaseUser?.email || "?")
        .charAt(0)
        .toUpperCase();

    return (
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
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 shrink-0">
                    <div className="w-9 h-9 grid place-items-center gradient-brand shadow-lg">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                            <rect x="9" y="9" width="6" height="6" />
                            <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
                        </svg>
                    </div>
                    <span className="font-display font-bold tracking-tight text-[16px] hidden sm:inline">
            Setup Builder
          </span>
                </Link>

                {!hideSearch && <SearchBar className="hidden lg:flex" />}

                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />
                    {firebaseUser ? (
                        <>
                            <Link
                                to="/profile"
                                className="hidden sm:flex items-center gap-2 text-[12.5px] text-dim hover:text-body transition"
                                title="View profile"
                            >
                <span
                    className="w-7 h-7 shrink-0 grid place-items-center text-white font-display font-bold text-[11.5px] overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #ff1e79, #8b2ff7)" }}
                >
                  {me?.avatarUrl ? (
                      <img
                          src={toAbsoluteUrl(me.avatarUrl)}
                          alt=""
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
                                className="text-[12.5px] text-dim hover:text-pink transition px-2"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="hidden sm:inline text-[13px] text-dim hover:text-body transition px-3"
                            >
                                Sign in
                            </Link>
                            <Link to="/register" className="btn-yellow !py-2 !px-4 !text-[13px]">
                                GET STARTED
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="hidden md:block border-t border-token">
                <div className="max-w-7xl mx-auto px-6 h-11 flex items-center gap-1">
                    <NavLink to="/components" className={linkClass}>Components</NavLink>
                    <NavLink to="/builder" className={linkClass}>Builder</NavLink>
                    <NavLink to="/my-builds" className={linkClass}>My Builds</NavLink>
                    <NavLink to="/public-builds" className={linkClass}>Community</NavLink>
                    {firebaseUser && (
                        <NavLink to="/profile" className={linkClass}>Profile</NavLink>
                    )}
                    {me?.role === "ADMIN" && (
                        <NavLink to="/admin" className={linkClass}>Admin</NavLink>
                    )}
                    <span className="ml-auto text-[12px] text-dim">Build. Compare. Share.</span>
                </div>
            </div>
        </header>
    );
}