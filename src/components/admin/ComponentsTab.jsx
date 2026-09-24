import { useCallback, useEffect, useState } from "react";
import {
    adminCreateComponent,
    adminListComponents,
    adminSetComponentActive,
    adminUpdateComponent,
} from "../../services/adminService";
import { useLang } from "../../context/LanguageContext";

const CATEGORIES = ["CPU", "GPU", "MOTHERBOARD", "RAM", "STORAGE", "POWER_SUPPLY", "CASE"];

const EMPTY_FORM = {
    id: null,
    name: "",
    category: "CPU",
    brand: "",
    model: "",
    imageUrl: "",
    fallbackPrice: 0,
    specs: "",
    active: true,
};

const inputCls =
    "w-full px-3 py-2 text-[13.5px] bg-page border border-token text-body placeholder:text-dim focus:outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/15 transition";

export default function ComponentsTab() {
    const { t, n } = useLang();
    const [data, setData] = useState(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const load = useCallback(() => {
        setLoading(true);
        adminListComponents(page, 30)
            .then(setData)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [page]);

    useEffect(() => {
        load();
    }, [load]);

    const openNew = () => {
        setEditing({ ...EMPTY_FORM });
        setFormError("");
    };

    const openEdit = (c) => {
        setEditing({
            id: c.id,
            name: c.name,
            category: c.category,
            brand: c.brand || "",
            model: c.model || "",
            imageUrl: c.imageUrl || "",
            fallbackPrice: c.price ?? 0,
            specs: Object.entries(c.specs || {})
                .map(([k, v]) => `${k}=${v}`)
                .join(", "),
            active: true,
        });
        setFormError("");
    };

    const parseSpecs = (raw) => {
        const out = {};
        raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((pair) => {
                const [k, ...rest] = pair.split("=");
                if (k && rest.length) out[k.trim()] = rest.join("=").trim();
            });
        return out;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            const payload = {
                name: editing.name,
                category: editing.category,
                brand: editing.brand,
                model: editing.model,
                imageUrl: editing.imageUrl,
                fallbackPrice: Number(editing.fallbackPrice) || 0,
                specs: parseSpecs(editing.specs),
                active: editing.active,
            };
            if (editing.id) await adminUpdateComponent(editing.id, payload);
            else await adminCreateComponent(payload);
            setEditing(null);
            load();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const onToggleActive = async (c) => {
        try {
            await adminSetComponentActive(c.id, !c.active);
            load();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={openNew}
                    className="btn-primary !py-2 !px-4 !text-[13px]"
                >
                    {t("admin.addComponent")}
                </button>
            </div>

            {loading && (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-14 border border-token bg-surface animate-pulse" />
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
                    <div className="border border-token bg-surface divide-y divide-[color:var(--border)]">
                        {data.content.map((c) => (
                            <div key={c.id} className="p-4 flex items-center gap-4">
                                <div className="w-10 shrink-0 text-[10px] font-mono uppercase text-accent">
                                    {c.category.replace("_", " ")}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-display font-semibold text-[14px] truncate">
                                        {c.name}
                                    </div>
                                    <div className="text-[11.5px] text-dim truncate">
                                        {c.brand}
                                        {c.model ? ` · ${c.model}` : ""}
                                    </div>
                                </div>
                                <div className="text-[13px] font-mono text-accent shrink-0">
                                    {n(c.price)} SAR
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(c)}
                                        className="text-[11.5px] border border-token px-2.5 py-1 text-dim hover:text-accent hover:border-[color:var(--accent)]/40 transition"
                                    >
                                        {t("admin.edit")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onToggleActive(c)}
                                        className="text-[11.5px] border border-token px-2.5 py-1 text-dim hover:text-red-500 hover:border-red-500/40 transition"
                                    >
                                        {t("admin.deactivate")}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {data.content.length === 0 && (
                            <div className="p-8 text-center text-dim text-[13px]">
                                {t("admin.noComponents")}
                            </div>
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
                                {t("misc.prev")}
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
                                {t("misc.next")}
                            </button>
                        </div>
                    )}
                </>
            )}

            {editing && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
                    onClick={() => !saving && setEditing(null)}
                >
                    <form
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={onSubmit}
                        className="w-full max-w-lg border border-token bg-surface p-6 space-y-4 max-h-[90vh] overflow-auto"
                    >
                        <h2 className="font-display text-lg font-bold">
                            {editing.id ? t("admin.editComponent") : t("admin.newComponent")}
                        </h2>

                        {formError && (
                            <div className="border border-red-500/30 bg-red-500/10 p-2.5 text-[12.5px] text-red-500">
                                {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="text-[11px] uppercase tracking-wider text-dim">
                                    {t("admin.fieldName")}
                                </label>
                                <input
                                    required
                                    value={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                    className={inputCls + " mt-1"}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] uppercase tracking-wider text-dim">
                                    {t("admin.fieldCategory")}
                                </label>
                                <select
                                    value={editing.category}
                                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                    className={inputCls + " mt-1"}
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c.replace("_", " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] uppercase tracking-wider text-dim">
                                    {t("admin.fieldPrice")}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editing.fallbackPrice}
                                    onChange={(e) =>
                                        setEditing({ ...editing, fallbackPrice: e.target.value })
                                    }
                                    className={inputCls + " mt-1"}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] uppercase tracking-wider text-dim">
                                    {t("admin.fieldBrand")}
                                </label>
                                <input
                                    value={editing.brand}
                                    onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                                    className={inputCls + " mt-1"}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] uppercase tracking-wider text-dim">
                                    {t("admin.fieldModel")}
                                </label>
                                <input
                                    value={editing.model}
                                    onChange={(e) => setEditing({ ...editing, model: e.target.value })}
                                    className={inputCls + " mt-1"}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[11px] uppercase tracking-wider text-dim">
                                    {t("admin.fieldSpecs")}{" "}
                                    <span className="opacity-60 normal-case">{t("admin.specsHint")}</span>
                                </label>
                                <input
                                    value={editing.specs}
                                    onChange={(e) => setEditing({ ...editing, specs: e.target.value })}
                                    placeholder={t("admin.specsPlaceholder")}
                                    className={inputCls + " mt-1"}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[11px] uppercase tracking-wider text-dim">
                                    {t("admin.fieldImageUrl")}
                                </label>
                                <input
                                    value={editing.imageUrl}
                                    onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                                    className={inputCls + " mt-1"}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                disabled={saving}
                                className="btn-secondary !py-2 !px-4 !text-[13px]"
                            >
                                {t("admin.cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary !py-2 !px-4 !text-[13px] disabled:opacity-50"
                            >
                                {saving ? t("admin.saving") : t("admin.save")}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}