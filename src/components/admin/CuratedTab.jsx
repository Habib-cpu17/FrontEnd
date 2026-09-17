import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    adminAddCurated,
    adminListBuilds,
    adminRemoveCurated,
    adminSetCuratedRank,
    listCurated,
} from "../../services/adminService";
import Reveal from "../Reveal";

export default function CuratedTab() {
    const [allBuilds, setAllBuilds] = useState(null);
    const [curated, setCurated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

    const refresh = useCallback(async () => {
        try {
            const [buildsPage, curatedList] = await Promise.all([
                adminListBuilds(0, 50),
                listCurated(),
            ]);
            setAllBuilds(buildsPage);
            setCurated(curatedList);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const curatedIds = new Set(curated.map((c) => c.id));

    const onToggle = async (build) => {
        setBusyId(build.id);
        try {
            if (curatedIds.has(build.id)) await adminRemoveCurated(build.id);
            else await adminAddCurated(build.id);
            await refresh();
        } catch (e) {
            alert(e.message);
        } finally {
            setBusyId(null);
        }
    };

    const onSetRank = async (buildId, rank) => {
        try {
            await adminSetCuratedRank(buildId, Number(rank));
            await refresh();
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="space-y-6">
            <Reveal>
                <div>
                    <h2 className="font-display text-lg font-semibold mb-1">Curated Builds</h2>
                    <p className="text-[13px] text-dim">
                        Curated builds appear on the landing page, ordered by rank.
                    </p>
                </div>
            </Reveal>

            {loading && <p className="text-dim text-[13px]">Loading…</p>}
            {error && (
                <div className="border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-500">
                    {error}
                </div>
            )}

            {!loading && curated.length > 0 && (
                <div className="border border-token bg-surface p-5">
                    <h3 className="eyebrow mb-3">Currently curated · {curated.length}</h3>
                    <div className="space-y-2">
                        {curated.map((b) => (
                            <div
                                key={b.id}
                                className="flex items-center gap-3 border border-token bg-page p-3"
                            >
                <span className="font-mono text-[11px] text-dim w-16 shrink-0">
                  #{String(b.id).padStart(4, "0")}
                </span>
                                <Link
                                    to={`/builds/${b.id}`}
                                    className="font-display font-semibold text-[13.5px] truncate hover:text-accent transition"
                                >
                                    {b.name}
                                </Link>
                                <div className="ml-auto flex items-center gap-2 shrink-0">
                                    <label className="text-[11px] text-dim">rank</label>
                                    <input
                                        type="number"
                                        defaultValue={b.curatedRank ?? 0}
                                        onBlur={(e) => onSetRank(b.id, e.target.value)}
                                        className="w-14 bg-surface border border-token px-2 py-1 text-[12px] text-center font-mono focus:outline-none focus:border-[color:var(--accent)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onToggle(b)}
                                        disabled={busyId === b.id}
                                        className="text-[11.5px] border border-token text-dim hover:text-red-500 hover:border-red-500/40 px-2 py-1 transition disabled:opacity-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && allBuilds && (
                <div className="border border-token bg-surface p-5">
                    <h3 className="eyebrow mb-3">All public builds</h3>
                    <div className="space-y-2">
                        {allBuilds.content
                            .filter((b) => b.isPublic)
                            .map((b) => {
                                const isCurated = curatedIds.has(b.id);
                                return (
                                    <div
                                        key={b.id}
                                        className="flex items-center gap-3 border border-token bg-page p-3"
                                    >
                    <span className="font-mono text-[11px] text-dim w-16 shrink-0">
                      #{String(b.id).padStart(4, "0")}
                    </span>
                                        <Link
                                            to={`/builds/${b.id}`}
                                            className="font-display font-semibold text-[13.5px] truncate hover:text-accent transition"
                                        >
                                            {b.name}
                                        </Link>
                                        <span className="text-[11px] text-dim truncate hidden sm:inline">
                      by {b.userDisplayName || "Anonymous"}
                    </span>
                                        <button
                                            type="button"
                                            onClick={() => onToggle(b)}
                                            disabled={busyId === b.id}
                                            className={`ml-auto text-[11.5px] px-3 py-1 border transition shrink-0 disabled:opacity-50 ${
                                                isCurated
                                                    ? "border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                                                    : "border-token text-dim hover:text-accent hover:border-[color:var(--accent)]/40"
                                            }`}
                                        >
                                            {busyId === b.id ? "…" : isCurated ? "Remove" : "Curate"}
                                        </button>
                                    </div>
                                );
                            })}
                        {allBuilds.content.filter((b) => b.isPublic).length === 0 && (
                            <p className="text-dim text-[12.5px] py-2">No public builds yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}