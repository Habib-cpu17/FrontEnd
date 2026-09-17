import { useEffect, useState } from "react";
import Reveal from "../components/Reveal";
import ComponentsTab from "../components/admin/ComponentsTab";
import CuratedTab from "../components/admin/CuratedTab";
import UsersTab from "../components/admin/UsersTab";
import { adminGetPriceProvider, adminRefreshPrices } from "../services/adminService";

const TABS = [
    { key: "components", label: "Components" },
    { key: "curated", label: "Curated Builds" },
    { key: "users", label: "Users" },
];

export default function AdminPage() {
    const [tab, setTab] = useState("components");
    const [provider, setProvider] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [refreshMsg, setRefreshMsg] = useState("");

    useEffect(() => {
        adminGetPriceProvider().then(setProvider).catch(() => setProvider("unknown"));
    }, []);

    const onRefreshPrices = async () => {
        setRefreshing(true);
        setRefreshMsg("");
        try {
            const res = await adminRefreshPrices();
            setRefreshMsg(
                `Updated ${res.changed} price${res.changed === 1 ? "" : "s"} using "${res.provider}".`
            );
        } catch (e) {
            setRefreshMsg(`Error: ${e.message}`);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="space-y-8">
            <Reveal>
                <div>
                    <div className="eyebrow mb-2">Admin</div>
                    <h1 className="font-display text-3xl font-bold">Dashboard</h1>
                    <p className="text-[13.5px] text-dim mt-1.5">
                        Manage the catalog, curated builds, and users.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-[11.5px] font-mono text-dim">
              provider: <span className="text-accent">{provider || "…"}</span>
            </span>
                        <button
                            type="button"
                            onClick={onRefreshPrices}
                            disabled={refreshing}
                            className="text-[12.5px] font-medium px-3.5 py-2 border border-token text-accent hover:opacity-80 transition disabled:opacity-50"
                        >
                            {refreshing ? "Refreshing…" : "Refresh prices now"}
                        </button>
                        {refreshMsg && <span className="text-[12px] text-dim">{refreshMsg}</span>}
                    </div>
                </div>
            </Reveal>

            <Reveal delay={80}>
                <div className="flex flex-wrap gap-2 border-b border-token">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`relative px-3.5 py-2.5 text-[13.5px] transition ${
                                tab === t.key ? "text-body font-medium" : "text-dim hover:text-body"
                            }`}
                        >
                            {t.label}
                            {tab === t.key && (
                                <span
                                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                                    style={{ background: "var(--accent)" }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </Reveal>

            <div>
                {tab === "components" && <ComponentsTab />}
                {tab === "curated" && <CuratedTab />}
                {tab === "users" && <UsersTab />}
            </div>
        </div>
    );
}