import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SearchBar({ className = "" }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [query, setQuery] = useState("");

    // Sync the input value with the ?q= URL param when on /components
    useEffect(() => {
        if (location.pathname === "/components") {
            const params = new URLSearchParams(location.search);
            setQuery(params.get("q") || "");
        } else {
            setQuery("");
        }
    }, [location.pathname, location.search]);

    const submit = () => {
        const trimmed = query.trim();
        if (trimmed) {
            navigate(`/components?q=${encodeURIComponent(trimmed)}`);
        } else {
            navigate("/components");
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") submit();
    };

    return (
        <div className={`search-shell ${className}`}>
            <div className="search-input-wrap">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Search components…"
                    className="flex-1 h-full bg-transparent px-4 text-[13px] text-body placeholder:text-dim focus:outline-none"
                />
                <div className="search-cat">
                    All Categories
                    <svg
                        className="ml-1.5"
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>
            <button
                type="button"
                onClick={submit}
                className="search-btn"
                aria-label="Search"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                </svg>
            </button>
        </div>
    );
}