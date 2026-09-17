import { useCallback, useEffect, useState } from "react";
import { adminListUsers, adminUpdateUserRole } from "../../services/adminService";
import { useMe } from "../../hooks/useMe";

export default function UsersTab() {
    const { me } = useMe();
    const [data, setData] = useState(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        adminListUsers(page, 30)
            .then(setData)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [page]);

    useEffect(() => {
        load();
    }, [load]);

    const onChangeRole = async (user, role) => {
        if (!confirm(`Change ${user.email}'s role to ${role}?`)) return;
        setBusyId(user.id);
        try {
            await adminUpdateUserRole(user.id, role);
            load();
        } catch (e) {
            alert(e.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-5">
            {loading && <p className="text-dim text-[13px]">Loading…</p>}
            {error && (
                <div className="border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-500">
                    {error}
                </div>
            )}

            {!loading && data && (
                <>
                    <div className="border border-token bg-surface divide-y divide-[color:var(--border)]">
                        {data.content.map((u) => (
                            <div key={u.id} className="p-4 flex items-center gap-4">
                                <div
                                    className="w-9 h-9 grid place-items-center font-display font-semibold text-[13px] shrink-0 border border-token"
                                    style={{ background: "var(--bg)", color: "var(--accent)" }}
                                >
                                    {(u.displayName || u.email || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-display font-semibold text-[13.5px] truncate">
                                        {u.displayName || "—"}
                                    </div>
                                    <div className="text-[11.5px] text-dim truncate">{u.email}</div>
                                </div>
                                <div className="text-[12px] text-dim font-mono shrink-0 hidden sm:block">
                                    {u.buildCount} build{u.buildCount === 1 ? "" : "s"}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                  <span
                      className={`text-[10.5px] font-mono uppercase tracking-wider px-2 py-0.5 ${
                          u.role === "ADMIN"
                              ? "bg-amber-500/15 border border-amber-500/30 text-amber-500"
                              : "bg-page border border-token text-dim"
                      }`}
                  >
                    {u.role}
                  </span>
                                    {me?.id !== u.id && (
                                        <button
                                            type="button"
                                            disabled={busyId === u.id}
                                            onClick={() =>
                                                onChangeRole(u, u.role === "ADMIN" ? "USER" : "ADMIN")
                                            }
                                            className="text-[11.5px] border border-token px-2.5 py-1 text-dim hover:text-accent hover:border-[color:var(--accent)]/40 transition disabled:opacity-50"
                                        >
                                            {u.role === "ADMIN" ? "Demote" : "Promote"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {data.content.length === 0 && (
                            <div className="p-8 text-center text-dim text-[13px]">No users found.</div>
                        )}
                    </div>

                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                disabled={data.number === 0}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                className="btn-secondary !py-2 !px-3.5 !text-[13px] disabled:opacity-30"
                            >
                                Prev
                            </button>
                            <span className="text-[13px] text-dim font-mono">
                {data.number + 1} / {data.totalPages}
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