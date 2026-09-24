import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLang } from "../context/LanguageContext";
import {
    createBuild,
    updateBuild,
    checkCompatibility,
    getBuild,
} from "../services/buildService";
import { getComponent, listComponents } from "../services/componentService";
import Reveal from "../components/Reveal";

const CATEGORIES = [
    { key: "CPU", label: "builder.catCPU", required: true },
    { key: "MOTHERBOARD", label: "builder.catMotherboard", required: true },
    { key: "RAM", label: "builder.catMemory", required: true },
    { key: "GPU", label: "builder.catGpu", required: false },
    { key: "STORAGE", label: "builder.catStorage", required: true },
    { key: "POWER_SUPPLY", label: "builder.catPowerSupply", required: true },
    { key: "CASE", label: "builder.catCase", required: true },
];

const DRAFT_KEY = "draftComponents";
const EDIT_KEY = "draftEditId";
const META_KEY = "draftMeta";

export default function BuilderPage() {
    const { firebaseUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const { t, n } = useLang();
    const { id: editId } = useParams();

    const [draft, setDraft] = useState([]);
    const [name, setName] = useState(() => t("builder.defaultBuildName"));
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [warnings, setWarnings] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [pickerOpen, setPickerOpen] = useState(null);
    const [pickerItems, setPickerItems] = useState([]);
    const [pickerLoading, setPickerLoading] = useState(false);
    const [pickerSearch, setPickerSearch] = useState("");

    useEffect(() => {
        let cancelled = false;
        const loadFromSession = () => {
            const raw = sessionStorage.getItem(DRAFT_KEY);
            const meta = sessionStorage.getItem(META_KEY);
            setDraft(raw ? JSON.parse(raw) : []);
            if (meta) {
                const m = JSON.parse(meta);
                setName(m.name);
                setDescription(m.description || "");
                setIsPublic(!!m.isPublic);
            }
        };

        if (editId) {
            const pending = sessionStorage.getItem(EDIT_KEY);
            if (pending === String(editId) && sessionStorage.getItem(DRAFT_KEY)) {
                loadFromSession();
                setLoading(false);
                return;
            }
            setLoading(true);
            getBuild(editId)
                .then(async (b) => {
                    if (cancelled) return;
                    const enriched = await Promise.all(
                        b.components.map(async (bc) => {
                            const c = await getComponent(bc.component.id);
                            return { id: c.id, name: c.name, category: c.category, price: c.price };
                        })
                    );
                    if (cancelled) return;
                    const meta = { name: b.name, description: b.description || "", isPublic: !!b.isPublic };
                    sessionStorage.setItem(EDIT_KEY, String(editId));
                    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(enriched));
                    sessionStorage.setItem(META_KEY, JSON.stringify(meta));
                    setDraft(enriched);
                    setName(meta.name);
                    setDescription(meta.description);
                    setIsPublic(meta.isPublic);
                })
                .catch((err) => !cancelled && setError(err.message))
                .finally(() => !cancelled && setLoading(false));
        } else {
            if (sessionStorage.getItem(EDIT_KEY)) {
                sessionStorage.removeItem(EDIT_KEY);
                sessionStorage.removeItem(DRAFT_KEY);
                sessionStorage.removeItem(META_KEY);
            }
            loadFromSession();
            setLoading(false);
        }
        return () => { cancelled = true; };
    }, [editId]);

    useEffect(() => {
        if (!editId) return;
        if (sessionStorage.getItem(EDIT_KEY) !== String(editId)) return;
        sessionStorage.setItem(META_KEY, JSON.stringify({ name, description, isPublic }));
    }, [editId, name, description, isPublic]);

    useEffect(() => {
        if (draft.length === 0) { setWarnings([]); return; }
        const components = draft.map((d) => ({ componentId: d.id, quantity: 1 }));
        checkCompatibility(components).then(setWarnings).catch(() => setWarnings([]));
    }, [draft]);

    const openPicker = async (categoryKey) => {
        setPickerOpen(categoryKey);
        setPickerSearch("");
        setPickerLoading(true);
        try {
            const res = await listComponents({ category: categoryKey, size: 60 });
            setPickerItems(res.content || []);
        } catch (e) {
            toast.error(t("builder.loadComponentsError"));
            setPickerItems([]);
        } finally {
            setPickerLoading(false);
        }
    };

    const pickComponent = (c) => {
        const next = draft.filter((d) => d.category !== c.category);
        next.push({ id: c.id, name: c.name, category: c.category, price: c.price });
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
        setDraft(next);
        setPickerOpen(null);
        toast.success(t("builder.addedToast", { name: c.name }));
    };

    const removeItem = (category) => {
        const next = draft.filter((d) => d.category !== category);
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
        setDraft(next);
    };

    const clearAll = () => {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify([]));
        setDraft([]);
    };

    const cancelEdit = () => {
        sessionStorage.removeItem(EDIT_KEY);
        sessionStorage.removeItem(DRAFT_KEY);
        sessionStorage.removeItem(META_KEY);
        navigate(editId ? `/builds/${editId}` : "/dashboard");
    };

    const total = draft.reduce((sum, d) => sum + Number(d.price || 0), 0);

    const onSave = async () => {
        setError("");
        if (draft.length === 0) {
            setError(t("builder.saveMinError"));
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name,
                description,
                isPublic,
                components: draft.map((d) => ({ componentId: d.id, quantity: 1 })),
            };
            const saved = editId ? await updateBuild(editId, payload) : await createBuild(payload);
            sessionStorage.removeItem(EDIT_KEY);
            sessionStorage.removeItem(DRAFT_KEY);
            sessionStorage.removeItem(META_KEY);
            toast.success(editId ? t("builder.updatedToast") : t("builder.savedToast"));
            navigate(`/builds/${saved.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const inputCls =
        "w-full px-3 py-2 text-[13.5px] bg-page border border-token text-body placeholder:text-dim focus:outline-none focus:border-[color:var(--purple)] focus:ring-2 focus:ring-[color:var(--purple)]/15 transition";

    if (!firebaseUser) {
        return (
            <div className="text-center py-20">
                <p className="text-dim mb-4">{t("builder.signInPrompt")}</p>
                <button onClick={() => navigate("/login")} className="btn-primary">
                    {t("builder.signIn")}
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] grid place-items-center">
                <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--border)", borderTopColor: "var(--purple)" }}
                />
            </div>
        );
    }

    const filteredPickerItems = pickerItems.filter(
        (c) => !pickerSearch || c.name.toLowerCase().includes(pickerSearch.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div className="eyebrow mb-2">{editId ? t("builder.eyebrowEditing") : t("builder.eyebrowNew")}</div>
                        <h1 className="font-display text-3xl md:text-4xl font-bold">
                            {editId ? t("builder.editBuild") : t("builder.pcBuilder")}
                        </h1>
                        <p className="text-[13.5px] text-dim mt-1.5">
                            {t("builder.introText")}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/components")}
                            className="btn-secondary !py-2 !px-4 !text-[13px]"
                        >
                            {t("builder.browseAllParts")}
                        </button>
                        {draft.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="text-[13px] text-red-500 hover:opacity-75 transition"
                            >
                                {t("builder.clearAll")}
                            </button>
                        )}
                    </div>
                </div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                    {CATEGORIES.map((c, i) => {
                        const selected = draft.find((d) => d.category === c.key);
                        return (
                            <Reveal key={c.key} delay={i * 50}>
                                <div
                                    className={`border bg-surface p-4 flex items-center justify-between transition ${
                                        selected ? "border-[color:var(--purple)]/40" : "border-token"
                                    }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-dim">
                                            {t(c.label)}
                                            {c.required && <span className="text-pink ms-1">*</span>}
                                        </div>
                                        <div className="font-display font-semibold text-[14.5px] mt-1 truncate">
                                            {selected ? selected.name : (
                                                <span className="text-dim font-normal">{t("builder.notSelected")}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ps-3 shrink-0">
                                        {selected && (
                                            <span className="text-[13px] font-semibold font-mono text-pink">
                        {n(selected.price)} SAR
                      </span>
                                        )}
                                        {selected ? (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(c.key)}
                                                className="text-[11.5px] border border-token px-2.5 py-1.5 text-dim hover:text-red-500 hover:border-red-500/40 transition"
                                            >
                                                {t("builder.remove")}
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => openPicker(c.key)}
                                            className="text-[11.5px] font-semibold px-3 py-1.5 transition gradient-brand text-white shadow hover:shadow-lg"
                                        >
                                            {selected ? t("builder.change") : t("builder.pick")}
                                        </button>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-20 space-y-4">
                        <Reveal delay={100}>
                            <div className="border border-token bg-surface p-5 space-y-4">
                                <h2 className="font-display font-bold text-[15px]">{t("builder.summary")}</h2>
                                <div>
                                    <label className="text-[11px] uppercase tracking-[0.14em] text-dim">
                                        {t("builder.buildName")}
                                    </label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={inputCls + " mt-1.5"}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] uppercase tracking-[0.14em] text-dim">
                                        {t("builder.description")}
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className={inputCls + " mt-1.5 resize-none"}
                                    />
                                </div>
                                <label className="flex items-center gap-2.5 text-[13px] cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="w-4 h-4"
                                        style={{ accentColor: "var(--purple)" }}
                                    />
                                    {t("builder.publishToCommunity")}
                                </label>
                            </div>
                        </Reveal>

                        <Reveal delay={180}>
                            <div className="border border-token bg-surface p-5">
                                <div className="flex justify-between text-[13px] text-dim">
                                    <span>{t("builder.components")}</span>
                                    <span className="font-mono">{draft.length}</span>
                                </div>
                                <div className="flex items-end justify-between mt-3 pt-4 border-t border-token">
                                    <span className="text-[12.5px] text-dim">{t("builder.total")}</span>
                                    <div className="text-end">
                    <span className="font-display text-2xl font-bold text-pink">
                      {n(total)}
                    </span>
                                        <span className="text-[12px] text-dim ms-1.5">SAR</span>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {warnings.length > 0 && (
                            <Reveal delay={220}>
                                <div className="border border-amber-500/30 bg-amber-500/[0.06] p-4 text-[12.5px]">
                                    <div className="font-semibold text-amber-600 dark:text-amber-400 mb-2">
                                        {t("builder.compatWarnings")}
                                    </div>
                                    <ul className="space-y-1 text-amber-700 dark:text-amber-300/90 list-disc list-inside">
                                        {warnings.map((w, i) => (
                                            <li key={i}>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>
                        )}

                        {error && (
                            <div className="border border-red-500/30 bg-red-500/10 p-3 text-[12.5px] text-red-500">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving || draft.length === 0}
                            className="btn-primary w-full justify-center disabled:opacity-40"
                        >
                            {saving ? t("builder.saving") : editId ? t("builder.updateBuild") : t("builder.saveBuild")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Inline picker drawer */}
            {pickerOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setPickerOpen(null)} />
                    <div className="slide-in-right w-full max-w-md bg-surface border-l border-token flex flex-col shadow-2xl">
                        <div className="p-5 border-b border-token flex items-center justify-between">
                            <div>
                                <div className="eyebrow">{t("builder.select")}</div>
                                <h3 className="font-display font-bold text-[17px] mt-0.5">
                                    {t(CATEGORIES.find((c) => c.key === pickerOpen)?.label)}
                                </h3>
                            </div>
                            <button
                                onClick={() => setPickerOpen(null)}
                                className="w-9 h-9 border border-token grid place-items-center hover:border-red-500/40 hover:text-red-500 transition"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 border-b border-token">
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="M21 21l-4.3-4.3" />
                                </svg>
                                <input
                                    autoFocus
                                    value={pickerSearch}
                                    onChange={(e) => setPickerSearch(e.target.value)}
                                    placeholder={t("builder.search")}
                                    className="w-full ps-9 pe-3 py-2 text-[13px] bg-page border border-token text-body placeholder:text-dim focus:outline-none focus:border-[color:var(--purple)] focus:ring-2 focus:ring-[color:var(--purple)]/15"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {pickerLoading && (
                                <div className="space-y-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="h-20 border border-token bg-page animate-pulse" />
                                    ))}
                                </div>
                            )}

                            {!pickerLoading && filteredPickerItems.length === 0 && (
                                <div className="text-center py-12 text-dim text-[13px]">
                                    {t("builder.noComponentsFound")}
                                </div>
                            )}

                            {!pickerLoading &&
                                filteredPickerItems.map((c) => {
                                    const current = draft.find((d) => d.category === c.category);
                                    const isSelected = current?.id === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => pickComponent(c)}
                                            className={`w-full text-start border p-3.5 transition-all hover:border-[color:var(--purple)]/60 ${
                                                isSelected
                                                    ? "border-[color:var(--purple)] bg-[color:var(--purple)]/5"
                                                    : "border-token"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-display font-semibold text-[13.5px] truncate">
                                                        {c.name}
                                                    </div>
                                                    <div className="text-[11.5px] text-dim truncate mt-0.5">
                                                        {c.brand}
                                                        {c.model ? ` · ${c.model}` : ""}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-1 text-[10.5px]">
                                                        {Object.entries(c.specs || {})
                                                            .slice(0, 3)
                                                            .map(([k, v]) => (
                                                                <span
                                                                    key={k}
                                                                    className="bg-page border border-token px-1.5 py-0.5 text-dim font-mono"
                                                                >
                                  {k}: {v}
                                </span>
                                                            ))}
                                                    </div>
                                                </div>
                                                <div className="text-end shrink-0">
                                                    <div className="font-display font-bold text-[14px] text-pink">
                                                        {n(c.price)}
                                                    </div>
                                                    <div className="text-[10px] text-dim">SAR</div>
                                                    {isSelected && (
                                                        <div className="mt-1 text-[10px] font-bold text-[color:var(--purple)] uppercase">
                                                            {t("builder.selected")}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>

                        <div className="p-4 border-t border-token text-[11.5px] text-dim text-center">
                            {t("builder.pickerHint")}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}