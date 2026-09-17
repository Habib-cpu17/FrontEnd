import { useEffect, useRef, useState } from "react";
import { useToast } from "../context/ToastContext";
import { updateMyProfile } from "../services/userService";
import { uploadAvatar, uploadBanner, toAbsoluteUrl } from "../services/uploadService";

const inputCls =
    "w-full px-3 py-2 text-[13.5px] bg-page border border-token text-body placeholder:text-dim focus:outline-none focus:border-[color:var(--purple)] focus:ring-2 focus:ring-[color:var(--purple)]/15 transition";

const AVATAR_MAX_MB = 2;
const BANNER_MAX_MB = 5;

export default function EditProfileModal({ open, profile, onClose, onSaved }) {
    const toast = useToast();
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Upload state per field
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [avatarErr, setAvatarErr] = useState("");
    const [bannerErr, setBannerErr] = useState("");

    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    useEffect(() => {
        if (open && profile) {
            setForm({
                displayName: profile.displayName || "",
                bio: profile.bio || "",
                location: profile.location || "",
                websiteUrl: profile.websiteUrl || "",
                avatarUrl: profile.avatarUrl || "",
                bannerUrl: profile.bannerUrl || "",
            });
            setError("");
            setAvatarErr("");
            setBannerErr("");
        }
    }, [open, profile]);

    if (!open || !form) return null;

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    // ─── Upload handlers ───

    const onAvatarPick = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-picking the same file
        if (!file) return;

        setAvatarErr("");
        if (!file.type.startsWith("image/")) {
            setAvatarErr("Only image files are allowed.");
            return;
        }
        if (file.size > AVATAR_MAX_MB * 1024 * 1024) {
            setAvatarErr(`Image is too large. Max ${AVATAR_MAX_MB} MB.`);
            return;
        }

        setAvatarUploading(true);
        try {
            const url = await uploadAvatar(file);
            set("avatarUrl", url);
        } catch (err) {
            setAvatarErr(err.message || "Upload failed");
        } finally {
            setAvatarUploading(false);
        }
    };

    const onBannerPick = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setBannerErr("");
        if (!file.type.startsWith("image/")) {
            setBannerErr("Only image files are allowed.");
            return;
        }
        if (file.size > BANNER_MAX_MB * 1024 * 1024) {
            setBannerErr(`Image is too large. Max ${BANNER_MAX_MB} MB.`);
            return;
        }

        setBannerUploading(true);
        try {
            const url = await uploadBanner(file);
            set("bannerUrl", url);
        } catch (err) {
            setBannerErr(err.message || "Upload failed");
        } finally {
            setBannerUploading(false);
        }
    };

    // ─── Save ───

    const onSubmit = async (e) => {
        e.preventDefault();
        if (avatarUploading || bannerUploading) return;
        setSaving(true);
        setError("");
        try {
            const updated = await updateMyProfile(form);
            toast.success("Profile updated");
            onSaved(updated);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4"
            onClick={() => !saving && onClose()}
        >
            <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={onSubmit}
                className="w-full max-w-2xl border border-token bg-surface max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="p-5 border-b border-token flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold">Edit profile</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="w-9 h-9 border border-token grid place-items-center hover:border-red-500/40 hover:text-red-500 transition"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                    {error && (
                        <div className="border border-red-500/30 bg-red-500/10 p-3 text-[12.5px] text-red-500">
                            {error}
                        </div>
                    )}

                    {/* Banner */}
                    <div>
                        <label className="text-[11px] uppercase tracking-wider text-dim block mb-1.5">
                            Banner <span className="opacity-60 normal-case">(max {BANNER_MAX_MB} MB · 1600×400 recommended)</span>
                        </label>
                        <div
                            className="relative h-28 overflow-hidden border border-token group cursor-pointer"
                            style={{ background: "linear-gradient(135deg, #ff1e79, #8b2ff7)" }}
                            onClick={() => !bannerUploading && bannerInputRef.current?.click()}
                        >
                            {form.bannerUrl ? (
                                <img
                                    src={toAbsoluteUrl(form.bannerUrl)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : null}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition grid place-items-center">
                <span className="text-white text-[12px] font-semibold px-3 py-1.5 bg-black/50">
                  {bannerUploading ? "Uploading…" : form.bannerUrl ? "Change banner" : "Upload banner"}
                </span>
                            </div>
                            {bannerUploading && (
                                <div className="absolute inset-0 bg-black/60 grid place-items-center">
                                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                                         style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff" }} />
                                </div>
                            )}
                        </div>
                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onBannerPick}
                        />
                        {form.bannerUrl && (
                            <button
                                type="button"
                                onClick={() => set("bannerUrl", "")}
                                className="mt-1.5 text-[11.5px] text-dim hover:text-red-500 transition"
                            >
                                Remove banner
                            </button>
                        )}
                        {bannerErr && (
                            <p className="mt-1.5 text-[11.5px] text-red-500">{bannerErr}</p>
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="flex items-start gap-4">
                        <div
                            className="relative w-20 h-20 shrink-0 overflow-hidden border-2 border-token grid place-items-center font-display font-bold text-3xl text-white cursor-pointer group"
                            style={{ background: "linear-gradient(135deg, #ff1e79, #8b2ff7)" }}
                            onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                        >
                            {form.avatarUrl ? (
                                <img
                                    src={toAbsoluteUrl(form.avatarUrl)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                (form.displayName || "?").charAt(0).toUpperCase()
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition grid place-items-center">
                <span className="text-[10px] text-white font-semibold">
                  {avatarUploading ? "…" : "Change"}
                </span>
                            </div>
                            {avatarUploading && (
                                <div className="absolute inset-0 bg-black/60 grid place-items-center">
                                    <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                                         style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff" }} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="text-[11px] uppercase tracking-wider text-dim block mb-1.5">
                                Avatar <span className="opacity-60 normal-case">(max {AVATAR_MAX_MB} MB · square)</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                                disabled={avatarUploading}
                                className="btn-secondary !py-2 !px-3.5 !text-[12.5px]"
                            >
                                {avatarUploading ? "Uploading…" : "Choose image"}
                            </button>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onAvatarPick}
                            />
                            {form.avatarUrl && (
                                <button
                                    type="button"
                                    onClick={() => set("avatarUrl", "")}
                                    className="ml-2 text-[11.5px] text-dim hover:text-red-500 transition"
                                >
                                    Remove
                                </button>
                            )}
                            {avatarErr && (
                                <p className="mt-1.5 text-[11.5px] text-red-500">{avatarErr}</p>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-[11px] uppercase tracking-wider text-dim block mb-1.5">
                            Display name
                        </label>
                        <input
                            value={form.displayName}
                            onChange={(e) => set("displayName", e.target.value)}
                            maxLength={100}
                            className={inputCls}
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="text-[11px] uppercase tracking-wider text-dim block mb-1.5">
                            Bio <span className="opacity-60 normal-case">({form.bio.length}/500)</span>
                        </label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => set("bio", e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Tell other builders about yourself…"
                            className={inputCls + " resize-none"}
                        />
                    </div>

                    {/* Location + Website */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] uppercase tracking-wider text-dim block mb-1.5">
                                Location
                            </label>
                            <input
                                value={form.location}
                                onChange={(e) => set("location", e.target.value)}
                                placeholder="Riyadh, Saudi Arabia"
                                maxLength={100}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] uppercase tracking-wider text-dim block mb-1.5">
                                Website
                            </label>
                            <input
                                value={form.websiteUrl}
                                onChange={(e) => set("websiteUrl", e.target.value)}
                                placeholder="https://yoursite.com"
                                maxLength={200}
                                className={inputCls}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-token flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="btn-secondary !py-2 !px-4 !text-[13px]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving || avatarUploading || bannerUploading}
                        className="btn-primary !py-2 !px-4 !text-[13px] disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}