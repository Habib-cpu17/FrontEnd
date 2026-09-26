import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listComponents } from "../services/componentService";
import { toAbsoluteUrl } from "../services/uploadService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Reveal from "../components/Reveal";
import { useLang } from "../context/LanguageContext";

const CATEGORIES = (t) => [
    { key: "", label: t("catalog.catAll") },
    { key: "CPU", label: t("catalog.catCPU") },
    { key: "GPU", label: t("catalog.catGPU") },
    { key: "MOTHERBOARD", label: t("catalog.catMotherboard") },
    { key: "RAM", label: t("catalog.catRAM") },
    { key: "STORAGE", label: t("catalog.catStorage") },
    { key: "POWER_SUPPLY", label: t("catalog.catPSU") },
    { key: "CASE", label: t("catalog.catCase") },
];

const CATEGORY_LABEL_KEY = {
    CPU: "catalog.catCPU",
    GPU: "catalog.catGPU",
    MOTHERBOARD: "catalog.catMotherboard",
    RAM: "catalog.catRAM",
    STORAGE: "catalog.catStorage",
    POWER_SUPPLY: "catalog.catPSU",
    CASE: "catalog.catCase",
};

export default function ComponentsPage() {
    const { firebaseUser } = useAuth();
    const toast = useToast();
    const { t, n } = useLang();
    const [searchParams, setSearchParams] = useSearchParams();

    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [search, setSearch] = useState(searchParams.get("q") || "");
    const [page, setPage] = useState(0);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addedId, setAddedId] = useState(null);

    // Sync state from URL when it changes (e.g. from navbar search on another page)
    useEffect(() => {
        setCategory(searchParams.get("category") || "");
        setSearch(searchParams.get("q") || "");
        setPage(0);
    }, [searchParams]);

    // Fetch data
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        listComponents({ category, search, page, size: 24 })
            .then((res) => !cancelled && setData(res))
            .catch((err) => !cancelled && setError(err.message || t("catalog.loadFailed")))
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, [category, search, page, t]);

    const updateUrl = useCallback(
        (nextCat, nextSearch) => {
            const params = new URLSearchParams();
            if (nextCat) params.set("category", nextCat);
            if (nextSearch) params.set("q", nextSearch);
            setSearchParams(params, { replace: true });
        },
        [setSearchParams]
    );

    const handleCategoryClick = (key) => {
        setCategory(key);
        setPage(0);
        updateUrl(key, search);
    };

    const handleSearchSubmit = () => {
        setPage(0);
        updateUrl(category, search);
    };

    const clearSearch = () => {
        setSearch("");
        setPage(0);
        updateUrl(category, "");
    };

    const addToDraft = (component) => {
        if (!firebaseUser) {
            toast.info(t("catalog.signInToAdd"));
            return;
        }
        const raw = sessionStorage.getItem("draftComponents");
        const draft = raw ? JSON.parse(raw) : [];
        const filtered = draft.filter((d) => d.category !== component.category);
        filtered.push({
            id: component.id,
            name: component.name,
            category: component.category,
            price: component.price,
        });
        sessionStorage.setItem("draftComponents", JSON.stringify(filtered));
        window.dispatchEvent(new Event("draft-updated"));
        setAddedId(component.id);
        toast.success(t("catalog.addedToast", { name: component.name }));
        setTimeout(() => setAddedId(null), 1500);
    };

    return (
        <div className="space-y-8">
            {/* Hero banner */}
            <Reveal>
                <div
                    className="relative overflow-hidden p-8 md:p-12"
                    style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}
                >
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(-45deg, transparent 0, transparent 22px, rgba(255,255,255,0.08) 22px, rgba(255,255,255,0.08) 24px)",
                        }}
                    />
                    <div className="absolute -right-16 -bottom-16 w-[300px] h-[300px] rounded-full bg-white/10 blur-3xl" />
                    <div className="relative max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/25 backdrop-blur text-white text-[11px] font-bold uppercase tracking-widest mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                            {t("catalog.heroBadge")}
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
                            {t("catalog.heroTitleLine1")}<br />{t("catalog.heroTitleLine2")}
                        </h1>
                        <p className="text-[14.5px] text-white/85 max-w-lg">
                            {t("catalog.heroSubtitle", { count: n(data?.totalElements ?? 43) })}
                        </p>
                    </div>
                </div>
            </Reveal>

            {/* Category pills */}
            <Reveal delay={80}>
                <div className="flex flex-wrap items-center gap-2">
                    {CATEGORIES(t).map((c) => {
                        const active = category === c.key;
                        return (
                            <button
                                key={c.key}
                                type="button"
                                onClick={() => handleCategoryClick(c.key)}
                                className={`px-4 py-2 text-[12.5px] font-semibold uppercase tracking-wide transition-all ${
                                    active
                                        ? "gradient-brand text-white shadow-lg"
                                        : "border border-token text-dim hover:text-pink hover:border-[color:var(--pink)]"
                                }`}
                            >
                                {c.label}
                            </button>
                        );
                    })}
                </div>
            </Reveal>

            {/* Angular search bar (page-level, synced with URL) */}
            <Reveal delay={140}>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="search-shell !max-w-xl">
                        <div className="search-input-wrap">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                                placeholder={t("catalog.searchPlaceholder")}
                                className="flex-1 h-full bg-transparent px-4 text-[13px] text-body placeholder:text-dim focus:outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="search-btn"
                            aria-label={t("catalog.searchButton")}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M21 21l-4.3-4.3" />
                            </svg>
                        </button>
                    </div>

                    {search && (
                        <div className="flex items-center gap-2 text-[12.5px] text-dim">
              <span>
                {t("catalog.resultsFor")} <span className="text-body font-semibold">"{search}"</span>
              </span>
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="px-2 py-1 border border-token text-dim hover:text-red-500 hover:border-red-500/40 transition text-[11px]"
                            >
                                {t("catalog.clear")}
                            </button>
                        </div>
                    )}
                </div>
            </Reveal>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-56 border border-token bg-surface animate-pulse" />
                    ))}
                </div>
            )}

            {error && (
                <div className="border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-500">
                    {error}
                </div>
            )}

            {!loading && data && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {data.content.map((c, i) => (
                            <Reveal key={c.id} delay={(i % 8) * 60}>
                                <div className="card group flex flex-col h-full overflow-hidden">
                                    <div
                                        className="aspect-[5/3] relative overflow-hidden"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, color-mix(in srgb, var(--purple) 12%, transparent), color-mix(in srgb, var(--pink) 12%, transparent))",
                                        }}
                                    >
                                        {c.imageUrl ? (
                                            <img
                                                src={toAbsoluteUrl(c.imageUrl)}
                                                alt={c.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center">
                                                <div className="font-display text-5xl font-bold opacity-15" style={{ color: "var(--purple)" }}>
                                                    {t(CATEGORY_LABEL_KEY[c.category] ?? c.category.replace("_", " ")).slice(0, 3)}
                                                </div>
                                            </div>
                                        )}
                                        <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 gradient-brand text-white uppercase tracking-wider">
                      {t(CATEGORY_LABEL_KEY[c.category] ?? c.category.replace("_", " "))}
                    </span>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="font-display font-semibold text-[14.5px] leading-snug line-clamp-2 min-h-[38px]">
                                            {c.name}
                                        </div>
                                        <div className="text-[11.5px] text-dim mt-1">
                                            {c.brand}{c.model ? ` · ${c.model}` : ""}
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-1 text-[10.5px]">
                                            {Object.entries(c.specs || {}).slice(0, 3).map(([k, v]) => (
                                                <span key={k} className="bg-page border border-token px-1.5 py-0.5 text-dim font-mono">
                          {k}: {v}
                        </span>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-4 flex items-end justify-between gap-2">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-dim font-semibold">{t("catalog.price")}</div>
                                                <div className="font-display font-bold text-[16px] text-pink">
                                                    {n(c.price)}
                                                    <span className="text-[11px] font-normal text-dim ms-1">SAR</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addToDraft(c)}
                                                className={`add-btn ${addedId === c.id ? "added" : ""}`}
                                            >
                                                {addedId === c.id ? (
                                                    <>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                        {t("catalog.added")}
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                        {t("catalog.add")}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    {data.content.length === 0 && (
                        <div className="border border-dashed border-token p-12 text-center">
                            <p className="text-dim text-sm">{t("catalog.noResults")}</p>
                        </div>
                    )}

                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-4">
                            <button
                                type="button"
                                disabled={data.number === 0}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                className="btn-secondary !py-2 !px-4 !text-[13px] disabled:opacity-30"
                            >
                                {t("misc.prev")}
                            </button>
                            <span className="text-[13px] text-dim font-mono">
                {n(data.number + 1)} / {n(data.totalPages)}
              </span>
                            <button
                                type="button"
                                disabled={data.number >= data.totalPages - 1}
                                onClick={() => setPage((p) => p + 1)}
                                className="btn-secondary !py-2 !px-4 !text-[13px] disabled:opacity-30"
                            >
                                {t("misc.next")}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Bottom CTA */}
            <Reveal delay={200}>
                <a
                    href="/builder"
                    className="block border border-token bg-surface p-4 hover:border-[color:var(--purple)] transition group"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="font-display font-semibold text-[14px] group-hover:text-pink transition">
                                {t("catalog.ctaTitle")}
                            </div>
                            <div className="text-[12px] text-dim mt-0.5">
                                {t("catalog.ctaText")}
                            </div>
                        </div>
                        <span className="btn-primary !py-2 !px-4 !text-[13px]">
              {t("catalog.ctaButton")}
            </span>
                    </div>
                </a>
            </Reveal>
        </div>
    );
}