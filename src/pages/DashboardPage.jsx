import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { listMyBuilds } from "../services/buildService";
import Reveal from "../components/Reveal";
import Counter from "../components/Counter";

export default function DashboardPage() {
    const { firebaseUser } = useAuth();
    const [me, setMe] = useState(null);
    const [buildsCount, setBuildsCount] = useState(null);
    const [publicCount, setPublicCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            api.get("/api/me").then((r) => r.data),
            listMyBuilds(0, 100).then((r) => r.content || []).catch(() => []),
        ])
            .then(([meData, builds]) => {
                if (cancelled) return;
                setMe(meData);
                setBuildsCount(builds.length);
                setPublicCount(builds.filter((b) => b.isPublic).length);
            })
            .catch(() => {})
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, []);

    const initial = (me?.displayName || firebaseUser?.email || "?")
        .charAt(0)
        .toUpperCase();

    return (
        <div className="space-y-8">
            {/* Hero */}
            <Reveal>
                <div className="rounded-2xl border border-token bg-surface p-8">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl grid place-items-center font-display text-2xl font-bold"
                             style={{ background: "var(--accent)", color: "var(--bg)" }}>
                            {initial}
                        </div>

                        <div className="min-w-0">
                            <div className="eyebrow mb-1">Signed in</div>
                            <h1 className="font-display text-2xl md:text-3xl font-bold truncate">
                                {me?.displayName || firebaseUser?.email?.split("@")[0] || "Welcome"}
                            </h1>
                            <p className="text-[13px] text-dim mt-1 truncate">
                                {me?.email || firebaseUser?.email}
                            </p>
                        </div>

                        <div className="ml-auto flex flex-wrap gap-3">
                            <Link to="/builder" className="btn-primary">
                                New build <span>→</span>
                            </Link>
                            <Link to="/my-builds" className="btn-secondary">
                                My builds
                            </Link>
                        </div>
                    </div>
                </div>
            </Reveal>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { label: "Total builds", value: buildsCount, hint: "Saved to your account" },
                    { label: "Published", value: publicCount, hint: "Visible to community" },
                    { label: "Role", value: me?.role || "—", hint: "Account level", isText: true },
                ].map((s, i) => (
                    <Reveal key={s.label} delay={i * 90}>
                        <div className="rounded-xl border border-token bg-surface p-5">
                            <div className="eyebrow">{s.label}</div>
                            <div className="font-display text-3xl font-bold mt-3">
                                {loading ? (
                                    <span className="inline-block w-8 h-8 rounded bg-page animate-pulse" />
                                ) : s.isText ? (
                                    s.value
                                ) : (
                                    <Counter to={s.value ?? 0} />
                                )}
                            </div>
                            <div className="text-[12px] text-dim mt-1">{s.hint}</div>
                        </div>
                    </Reveal>
                ))}
            </div>

            {/* Quick actions */}
            <Reveal delay={120}>
                <div>
                    <h2 className="font-display text-lg font-semibold mb-4">Quick actions</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { to: "/components",    t: "Browse components", d: "43 parts across 7 categories" },
                            { to: "/builder",       t: "Open builder",       d: "Start a new configuration" },
                            { to: "/my-builds",     t: "My builds",           d: "Review your saved rigs" },
                            { to: "/public-builds", t: "Community",           d: "See what others are building" },
                        ].map((a) => (
                            <Link key={a.to} to={a.to} className="card block p-4">
                                <div className="font-display font-semibold text-[14px] mb-1">
                                    {a.t}
                                </div>
                                <div className="text-[12px] text-dim">{a.d}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </Reveal>
        </div>
    );
}