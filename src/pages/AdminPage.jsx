import { useEffect, useState } from "react";
import Reveal from "../components/Reveal";
import ComponentsTab from "../components/admin/ComponentsTab";
import CuratedTab from "../components/admin/CuratedTab";
import UsersTab from "../components/admin/UsersTab";
import { adminGetPriceProvider, adminRefreshPrices } from "../services/adminService";
import { useLang } from "../context/LanguageContext";

export default function AdminPage() {
    const { t } = useLang();
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
                t(
                    res.changed === 1 ? "admin.updatedPricesOne" : "admin.updatedPrices",
                    { count: res.changed, provider: res.provider }
                )
            );
        } catch (e) {
            setRefreshMsg(t("admin.refreshError", { message: e.message }));
        } finally {
            setRefreshing(false);
        }
    };

    const TABS = [
        { key: "components", label: t("admin.tabs.components") },
        { key: "curated", label: t("admin.tabs.curated") },
        { key: "users", label: t("admin.tabs.users") },
    ];

    return (
        <div className="space-y-8">
            <Reveal>
                <div>
                    <div className="eyebrow mb-2">{t("admin.eyebrow")}</div>
                    <h1 className="font-display text-3xl font-bold">{t("admin.title")}</h1>
                    <p className="text-[13.5px] text-dim mt-1.5">{t("admin.subtitle")}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-[11.5px] font-mono text-dim">
              {t("admin.provider")} <span className="text-accent">{provider || "…"}</span>
            </span>
                        <button
                            type="button"
                            onClick={onRefreshPrices}
                            disabled={refreshing}
                            className="text-[12.5px] font-medium px-3.5 py-2 border border-token text-accent hover:opacity-80 transition disabled:opacity-50"
                        >
                            {refreshing ? t("admin.refreshing") : t("admin.refreshNow")}
                        </button>
                        {refreshMsg && <span className="text-[12px] text-dim">{refreshMsg}</span>}
                    </div>
                </div>
            </Reveal>

            <Reveal delay={80}>
                <div className="flex flex-wrap gap-2 border-b border-token">
                    {TABS.map((tb) => (
                        <button
                            key={tb.key}
                            type="button"
                            onClick={() => setTab(tb.key)}
                            className={`relative px-3.5 py-2.5 text-[13.5px] transition ${
                                tab === tb.key ? "text-body font-medium" : "text-dim hover:text-body"
                            }`}
                        >
                            {tb.label}
                            {tab === tb.key && (
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