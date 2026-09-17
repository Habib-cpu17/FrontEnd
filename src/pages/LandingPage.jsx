import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listPublicBuilds } from "../services/buildService";
import { listCurated } from "../services/adminService";
import Reveal from "../components/Reveal";
import ThemeToggle from "../components/ThemeToggle";
import SearchBar from "../components/SearchBar";

const CATEGORY_TILES = [
    { key: "GPU",          label: "Graphics Cards", count: 8, img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=700&q=80" },
    { key: "CPU",          label: "Processors",     count: 8, img: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=700&q=80" },
    { key: "MOTHERBOARD",  label: "Motherboards",   count: 6, img: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=700&q=80" },
    { key: "RAM",          label: "Memory",         count: 5, img: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=700&q=80" },
    { key: "STORAGE",      label: "Storage",        count: 5, img: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=80" },
    { key: "POWER_SUPPLY", label: "Power Supplies", count: 5, img: "https://images.unsplash.com/photo-1591405351990-4726e331f141?w=700&q=80" },
    { key: "CASE",         label: "Cases",          count: 6, img: "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=700&q=80" },
];

const TRUST = [
    { icon: "tag",    t: "Live SAR Prices",    d: "Updated from real retailer feeds" },
    { icon: "shield", t: "Auto Compatibility", d: "Socket, RAM, and PSU checks" },
    { icon: "users",  t: "Community Builds",   d: "Browse real rigs from builders" },
    { icon: "share",  t: "Save & Publish",     d: "One-click sharing with the community" },
];

const ICONS = {
    tag: (
        <>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <circle cx="7" cy="7" r="1.5" />
        </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    users: (
        <>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </>
    ),
    share: (
        <>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </>
    ),
};

const XMark = ({ className = "", strokeWidth = 6 }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none">
        <path
            d="M15 15 L85 85 M85 15 L15 85"
            stroke="white"
            strokeWidth={strokeWidth}
            strokeLinecap="square"
            opacity="0.35"
        />
    </svg>
);

// Speed in pixels per second. Lower = slower drift.
const SCROLL_SPEED = 40;

export default function LandingPage() {
    const { firebaseUser } = useAuth();
    const [builds, setBuilds] = useState([]);
    const [curated, setCurated] = useState([]);

    // ── Continuous scroll carousel ──
    const carouselRef = useRef(null);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(null);
    const pausedRef = useRef(false);

    useEffect(() => {
        listPublicBuilds(0, 4).then((r) => setBuilds(r?.content || [])).catch(() => {});
        listCurated().then((r) => setCurated(r || [])).catch(() => {});
    }, []);

    // Continuous rAF loop
    useEffect(() => {
        const tick = (now) => {
            const el = carouselRef.current;
            if (el && !pausedRef.current) {
                if (lastTimeRef.current == null) lastTimeRef.current = now;
                const dt = (now - lastTimeRef.current) / 1000; // seconds
                lastTimeRef.current = now;

                // Advance
                el.scrollLeft += SCROLL_SPEED * dt;

                // Loop seamlessly: we rendered two copies of the tiles,
                // so when we've scrolled past one full set, subtract its width.
                const firstCard = el.querySelector("[data-carousel-card]");
                if (firstCard) {
                    const step = firstCard.offsetWidth + 16; // width + gap
                    const setWidth = step * CATEGORY_TILES.length;
                    if (el.scrollLeft >= setWidth) {
                        el.scrollLeft -= setWidth;
                    }
                }
            } else {
                lastTimeRef.current = null;
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    const setPaused = (v) => {
        pausedRef.current = v;
    };

    const nudge = (dir = 1) => {
        const el = carouselRef.current;
        if (!el) return;
        const firstCard = el.querySelector("[data-carousel-card]");
        if (!firstCard) return;
        const step = (firstCard.offsetWidth + 16) * dir;
        const start = el.scrollLeft;
        const target = start + step;
        const t0 = performance.now();
        const duration = 400;
        const animate = (now) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            el.scrollLeft = start + step * eased;
            if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        // eslint-disable-next-line no-unused-vars
        void target;
    };

    const primaryHref = firebaseUser ? "/builder" : "/register";
    const displayBuilds = curated.length > 0 ? curated.slice(0, 4) : builds;

    // Render each tile twice — second set makes the loop seamless.
    const carouselTiles = [...CATEGORY_TILES, ...CATEGORY_TILES];

    return (
        <div className="min-h-screen bg-page text-body">
            {/* ═══════════ NAV ═══════════ */}
            <header
                className="sticky top-0 z-50 backdrop-blur-md border-b border-token"
                style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}
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

                    <SearchBar className="hidden lg:flex" />

                    <div className="ml-auto flex items-center gap-2">
                        <ThemeToggle />
                        {firebaseUser ? (
                            <Link to="/dashboard" className="btn-primary !py-2 !px-4 !text-[13px]">
                                Dashboard
                            </Link>
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
                    <div className="max-w-7xl mx-auto px-6 h-11 flex items-center gap-6 text-[12.5px] font-medium">
                        <Link to="/components" className="text-dim hover:text-pink transition uppercase">Components</Link>
                        <Link to="/builder" className="text-dim hover:text-pink transition uppercase">Builder</Link>
                        <Link to="/public-builds" className="text-dim hover:text-pink transition uppercase">Community</Link>
                        <Link to="/my-builds" className="text-dim hover:text-pink transition uppercase">My Builds</Link>
                        <span className="ml-auto text-dim">Build. Compare. Share.</span>
                    </div>
                </div>
            </header>

            {/* ═══════════ HERO ═══════════ */}
            <section className="relative pt-8 pb-12 overflow-hidden">
                <div
                    className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none"
                    style={{ background: "var(--glow-pink)" }}
                />
                <div
                    className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none"
                    style={{ background: "var(--glow-purple)" }}
                />

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-3 gap-4">
                        {/* BIG HERO BANNER */}
                        <Reveal className="lg:col-span-2">
                            <div
                                className="relative overflow-hidden h-full min-h-[400px]"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #ff1e79 0%, #8b2ff7 55%, #5b21b6 100%)",
                                }}
                            >
                                <div className="absolute inset-0 bg-stripes pointer-events-none" />
                                <div
                                    className="absolute left-0 bottom-0 w-[55%] h-[60%] bg-halftone pointer-events-none opacity-70"
                                    style={{
                                        maskImage: "linear-gradient(to top right, #000 40%, transparent 100%)",
                                        WebkitMaskImage: "linear-gradient(to top right, #000 40%, transparent 100%)",
                                    }}
                                />
                                <XMark className="absolute top-6 right-6 w-20 h-20 md:w-28 md:h-28 pointer-events-none" />
                                <div className="absolute left-8 bottom-6 w-40 h-3 bg-bars pointer-events-none" />

                                <div className="relative grid md:grid-cols-2 gap-4 p-8 md:p-12 min-h-[400px] items-center">
                                    <div className="space-y-5 z-10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/25 backdrop-blur text-white text-[11.5px] font-semibold uppercase tracking-widest">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                            Smart Builder
                                        </div>
                                        <h1 className="hero-in font-display text-[46px] md:text-[62px] leading-[0.95] font-bold text-white">
                                            Build The Rig
                                            <br />
                                            <span className="text-yellow-400" style={{ WebkitTextStroke: "2px #1a0b2e" }}>
                        You Actually Want
                      </span>
                                        </h1>
                                        <p
                                            className="hero-in text-[15px] text-white/85 max-w-sm leading-relaxed"
                                            style={{ animationDelay: "160ms" }}
                                        >
                                            Plan with live SAR pricing. Catch compatibility issues before you buy. Share it with the community.
                                        </p>
                                        <div
                                            className="hero-in flex flex-wrap gap-3 pt-2"
                                            style={{ animationDelay: "260ms" }}
                                        >
                                            <Link to={primaryHref} className="btn-yellow">
                                                START BUILDING
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <path d="M5 12h14M13 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                            <Link
                                                to="/public-builds"
                                                className="inline-flex items-center gap-2 px-5 py-3 border-2 border-white/40 text-white text-[14px] font-medium hover:bg-white/10 transition"
                                            >
                                                Explore Community
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="relative h-[280px] md:h-[360px] animate-floaty">
                                        <img
                                            src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80"
                                            alt="Gaming PC"
                                            className="w-full h-full object-cover shadow-2xl border-2 border-white/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* RIGHT SIDE STACK */}
                        <div className="grid grid-rows-3 gap-4">
                            <Reveal delay={100} className="row-span-2">
                                <div
                                    className="relative overflow-hidden h-full p-6 flex flex-col justify-between"
                                    style={{ background: "linear-gradient(135deg, #7a2ff7, #22d3ee)" }}
                                >
                                    <div className="absolute inset-0 bg-stripes pointer-events-none" />
                                    <div
                                        className="absolute left-0 top-0 w-[50%] h-[45%] bg-halftone pointer-events-none opacity-60"
                                        style={{
                                            maskImage: "linear-gradient(to bottom right, #000 40%, transparent 100%)",
                                            WebkitMaskImage: "linear-gradient(to bottom right, #000 40%, transparent 100%)",
                                        }}
                                    />
                                    <XMark className="absolute bottom-6 left-6 w-14 h-14 pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="text-[11px] uppercase tracking-widest text-white/80 font-bold mb-1">
                                            Featured
                                        </div>
                                        <div className="font-display text-2xl font-bold text-white leading-tight">
                                            Build With
                                            <br />
                                            Confidence
                                        </div>
                                        <p className="text-[12.5px] text-white/80 mt-2 max-w-[180px]">
                                            Every part checked. Every price in SAR.
                                        </p>
                                    </div>

                                    <Link to="/builder" className="relative z-10 self-start btn-yellow !py-2 !px-4 !text-[12px]">
                                        START →
                                    </Link>

                                    <img
                                        src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80"
                                        alt=""
                                        className="absolute right-0 bottom-0 w-40 opacity-50 pointer-events-none"
                                    />
                                </div>
                            </Reveal>

                            <Reveal delay={200}>
                                <div
                                    className="relative overflow-hidden h-full p-5 flex items-center justify-between"
                                    style={{ background: "linear-gradient(135deg, #ffc107, #ff8f00)" }}
                                >
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            backgroundImage:
                                                "repeating-linear-gradient(-45deg, transparent 0, transparent 22px, rgba(26,11,46,0.08) 22px, rgba(26,11,46,0.08) 24px)",
                                        }}
                                    />
                                    <XMark className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 opacity-50 pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="text-[11px] uppercase tracking-widest text-[#1a0b2e]/70 font-bold">
                                            Catalog
                                        </div>
                                        <div className="font-display text-xl font-bold text-[#1a0b2e] leading-tight">
                                            Browse
                                            <br />
                                            Components
                                        </div>
                                    </div>

                                    <Link
                                        to="/components"
                                        className="relative z-10 btn-primary !py-2 !px-3.5 !text-[12px] !bg-none"
                                        style={{ background: "#1a0b2e", color: "#fff" }}
                                    >
                                        EXPLORE →
                                    </Link>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                    {/* VALUE PROPS */}
                    <Reveal delay={300}>
                        <div className="mt-6 border border-token bg-surface p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {TRUST.map((t) => (
                                <div key={t.t} className="flex items-center gap-3">
                                    <div className="w-11 h-11 grid place-items-center gradient-brand-soft border border-token shrink-0">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            {ICONS[t.icon]}
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-display font-semibold text-[13.5px] leading-tight">{t.t}</div>
                                        <div className="text-[11.5px] text-dim leading-tight mt-0.5">{t.d}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════ FEATURED CATEGORIES — continuous smooth scroll ═══════════ */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal>
                        <div className="flex items-end justify-between mb-8 gap-4">
                            <div>
                                <div className="eyebrow mb-2">Browse</div>
                                <h2 className="font-display text-3xl md:text-4xl font-bold">
                                    Featured Categories
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => nudge(-1)}
                                    aria-label="Previous"
                                    className="w-10 h-10 border border-token grid place-items-center text-dim hover:text-pink hover:border-[color:var(--pink)] transition"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => nudge(1)}
                                    aria-label="Next"
                                    className="w-10 h-10 border border-token grid place-items-center text-dim hover:text-pink hover:border-[color:var(--pink)] transition"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 6l6 6-6 6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </Reveal>

                    {/* Carousel viewport */}
                    <div
                        onMouseEnter={() => setPaused(true)}
                        onMouseLeave={() => setPaused(false)}
                    >
                        <div
                            ref={carouselRef}
                            className="overflow-x-auto no-scrollbar"
                            style={{ scrollBehavior: "auto" }}
                        >
                            <div className="flex gap-4 pb-2">
                                {carouselTiles.map((c, idx) => (
                                    <Link
                                        key={`${c.key}-${idx}`}
                                        to={`/components?category=${c.key}`}
                                        data-carousel-card
                                        className="group block shrink-0"
                                        style={{ width: "min(340px, 78vw)" }}
                                    >
                                        <div className="relative overflow-hidden border border-token">
                                            <div
                                                className="aspect-[4/5] overflow-hidden"
                                                style={{ background: "var(--surface-2)" }}
                                            >
                                                <img
                                                    src={c.img}
                                                    alt={c.label}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    draggable={false}
                                                />
                                            </div>
                                            <span className="absolute top-3 left-3 text-[10.5px] font-bold px-2 py-0.5 gradient-brand text-white">
                        {c.count} Products
                      </span>
                                        </div>
                                        <div className="mt-3">
                                            <h3 className="font-display font-semibold text-[16px] group-hover:text-pink transition">
                                                {c.label}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ TOP COMMUNITY BUILDS ═══════════ */}
            <section className="py-16 border-t border-token">
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal>
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <div className="eyebrow mb-2">Community</div>
                                <h2 className="font-display text-3xl md:text-4xl font-bold">
                                    Top Community Builds
                                </h2>
                            </div>
                            <Link
                                to="/public-builds"
                                className="text-[13px] font-semibold text-pink hover:underline underline-offset-4"
                            >
                                View All →
                            </Link>
                        </div>
                    </Reveal>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(displayBuilds.length > 0
                                ? displayBuilds
                                : Array.from({ length: 4 }, (_, i) => ({
                                    id: `demo-${i}`,
                                    name: ["Gaming Rig", "Creator PC", "Budget Build", "Enthusiast"][i],
                                    totalPrice: [4800, 6500, 2200, 12000][i],
                                    components: Array(6 - i).fill(0),
                                }))
                        )
                            .slice(0, 4)
                            .map((b, i) => (
                                <Reveal key={b.id} delay={i * 90}>
                                    <Link
                                        to={String(b.id).startsWith("demo") ? "/builder" : `/builds/${b.id}`}
                                        className="card block h-full overflow-hidden group"
                                    >
                                        <div
                                            className="aspect-[4/3] relative overflow-hidden"
                                            style={{ background: "var(--surface-2)" }}
                                        >
                                            <img
                                                src={
                                                    [
                                                        "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80",
                                                        "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80",
                                                        "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&q=80",
                                                        "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=80",
                                                    ][i % 4]
                                                }
                                                alt={b.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <span className="absolute top-3 right-3 text-[10.5px] font-bold px-2 py-0.5 bg-yellow-400 text-[#1a0b2e]">
                        ★ Popular
                      </span>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-display font-semibold text-[14.5px] truncate group-hover:text-pink transition">
                                                {b.name}
                                            </h3>
                                            <div className="flex items-center justify-between mt-3">
                        <span className="font-display font-bold text-[16px] text-pink">
                          {Number(b.totalPrice).toLocaleString()}{" "}
                            <span className="text-[11px] font-normal text-dim">SAR</span>
                        </span>
                                                <span className="text-[11px] text-dim">
                          {b.components?.length || 0} parts
                        </span>
                                            </div>
                                            <div className="mt-3 w-full text-center py-2 border border-token text-[12px] font-semibold text-dim group-hover:bg-[color:var(--purple)] group-hover:text-white group-hover:border-transparent transition">
                                                VIEW BUILD →
                                            </div>
                                        </div>
                                    </Link>
                                </Reveal>
                            ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="py-16 border-t border-token">
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal>
                        <div
                            className="relative overflow-hidden grid md:grid-cols-2"
                            style={{ background: "linear-gradient(135deg, #8b2ff7, #ff1e79)" }}
                        >
                            <div className="absolute inset-0 bg-stripes pointer-events-none" />
                            <XMark className="absolute top-6 right-6 w-16 h-16 pointer-events-none" />

                            <div className="relative min-h-[320px] md:min-h-[380px] p-8 md:p-0">
                                <img
                                    src="https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=900&q=80"
                                    alt="Build your PC"
                                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                                />
                            </div>
                            <div className="p-10 md:p-14 flex flex-col justify-center text-white relative z-10">
                                <div className="text-[11px] uppercase tracking-widest font-bold text-yellow-300 mb-3">
                                    Custom Builds
                                </div>
                                <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-4">
                                    Build A Custom PC
                                </h2>
                                <p className="text-[14.5px] text-white/85 mb-8 max-w-sm">
                                    Designed by you. Priced in SAR. Verified by our compatibility engine.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link to={primaryHref} className="btn-yellow">
                                        START BUILDING
                                    </Link>
                                    <Link
                                        to="/components"
                                        className="inline-flex items-center gap-2 px-5 py-3 border-2 border-white/40 text-white text-[14px] font-medium hover:bg-white/10 transition"
                                    >
                                        Browse Parts
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="border-t border-token py-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-[12.5px] text-dim">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 gradient-brand grid place-items-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                <rect x="4" y="4" width="16" height="16" rx="2" />
                            </svg>
                        </div>
                        <span className="font-display font-bold">Setup Builder</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/components" className="hover:text-pink transition">Components</Link>
                        <Link to="/public-builds" className="hover:text-pink transition">Community</Link>
                        <span>© {new Date().getFullYear()}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}