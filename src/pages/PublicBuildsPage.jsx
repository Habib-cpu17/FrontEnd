import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { listPublicBuilds } from "../services/buildService";
import Reveal from "../components/Reveal";

export default function PublicBuildsPage() {
    const { t, n } = useLang();
    const [data, setData] = useState(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        listPublicBuilds(page, 12)
            .then((res) => !cancelled && setData(res))
            .catch((err) => !cancelled && setError(err.message || t("community.errorLoading")))
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, [page]);

    return (
        <div className="space-y-8">
            <Reveal>
                <div>
                    <div className="eyebrow mb-2">{t("community.community")}</div>
                    <h1 className="font-display text-3xl font-bold">{t("community.title")}</h1>
                    <p className="text-[13.5px] text-dim mt-1.5">
                        {t("community.subtitle")}
                    </p>
                </div>
            </Reveal>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 border border-token bg-surface animate-pulse" />
                    ))}
                </div>
            )}

            {error && (
                <div className="border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-500">
                    {error}
                </div>
            )}

            {!loading && data && data.content.length === 0 && (
                <Reveal>
                    <div className="border border-dashed border-token p-12 text-center">
                        <p className="text-dim text-sm">{t("community.emptyState")}</p>
                        <Link
                            to="/builder"
                            className="inline-block mt-4 text-accent text-[13.5px] hover:underline"
                        >
                            {t("community.emptyCta")} →
                        </Link>
                    </div>
                </Reveal>
            )}

            {!loading && data && data.content.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.content.map((b, i) => (
                            <Reveal key={b.id} delay={(i % 6) * 70}>
                                <Link to={`/builds/${b.id}`} className="card flex flex-col h-full p-5">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h3 className="font-display font-semibold text-[15px] truncate">
                                            {b.name}
                                        </h3>
                                        <span className="text-[10px] font-mono text-accent shrink-0 mt-0.5">
                      {b.components?.length === 1
                          ? t("community.parts_one")
                          : t("community.parts_other", { count: b.components?.length || 0 })}
                    </span>
                                    </div>
                                    <div className="text-[11.5px] text-dim mb-3">
                                        {t("community.by")}{" "}
                                        <Link
                                            to={`/users/${b.userId}`}
                                            className="hover:text-pink transition"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {b.userDisplayName || t("community.anonymous")}
                                        </Link>
                                    </div>
                                    {b.description && (
                                        <p className="text-[12px] text-dim line-clamp-2 mb-4 min-h-[32px]">
                                            {b.description}
                                        </p>
                                    )}
                                    <div className="mt-auto pt-3 border-t border-token flex items-center justify-between">
                    <span className="text-[11.5px] text-dim font-mono">
                      #{String(b.id).padStart(4, "0")}
                    </span>
                                        <span className="font-display font-semibold text-[13.5px] text-accent">
                      {n(b.totalPrice)} SAR
                    </span>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>

                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-4">
                            <button
                                type="button"
                                disabled={data.number === 0}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                className="btn-secondary !py-2 !px-3.5 !text-[13px] disabled:opacity-30"
                            >
                                {t("misc.prev")}
                            </button>
                            <span className="text-[13px] text-dim font-mono">
                {n(data.number + 1)} / {n(Math.max(1, data.totalPages))}
              </span>
                            <button
                                type="button"
                                disabled={data.number >= data.totalPages - 1}
                                onClick={() => setPage((p) => p + 1)}
                                className="btn-secondary !py-2 !px-3.5 !text-[13px] disabled:opacity-30"
                            >
                                {t("misc.next")}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}