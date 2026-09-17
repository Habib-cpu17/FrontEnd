import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMyBuilds } from "../services/buildService";
import Reveal from "../components/Reveal";

export default function MyBuildsPage() {
    const [data, setData] = useState(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        listMyBuilds(page, 12)
            .then((res) => !cancelled && setData(res))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, [page]);

    return (
        <div className="space-y-8">
            <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold">My Builds</h1>
                        <p className="text-[13.5px] text-dim mt-1.5">Your saved PC configurations.</p>
                    </div>
                    <Link to="/builder" className="btn-primary">
                        + New build
                    </Link>
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
                        <p className="text-dim text-sm mb-4">You haven't created any builds yet.</p>
                        <Link to="/builder" className="text-accent text-[13.5px] hover:underline">
                            Start building →
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
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className="font-display font-semibold text-[15px] truncate">
                                            {b.name}
                                        </h3>
                                        {b.isPublic ? (
                                            <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 shrink-0">
                        Public
                      </span>
                                        ) : (
                                            <span className="text-[10px] font-mono uppercase tracking-wider bg-page border border-token text-dim px-1.5 py-0.5 shrink-0">
                        Private
                      </span>
                                        )}
                                    </div>
                                    {b.description && (
                                        <p className="text-[12px] text-dim line-clamp-2 mb-4 min-h-[32px]">
                                            {b.description}
                                        </p>
                                    )}
                                    <div className="mt-auto pt-3 border-t border-token flex items-center justify-between">
                    <span className="text-[11.5px] text-dim font-mono">
                      {b.components.length} part{b.components.length === 1 ? "" : "s"}
                    </span>
                                        <span className="font-display font-semibold text-[13.5px] text-accent">
                      {Number(b.totalPrice).toLocaleString()} SAR
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
                                Prev
                            </button>
                            <span className="text-[13px] text-dim font-mono">
                {data.number + 1} / {Math.max(1, data.totalPages)}
              </span>
                            <button
                                type="button"
                                disabled={data.number >= data.totalPages - 1}
                                onClick={() => setPage((p) => p + 1)}
                                className="btn-secondary !py-2 !px-3.5 !text-[13px] disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}