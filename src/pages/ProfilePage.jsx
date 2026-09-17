import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMe } from "../hooks/useMe";
import { getProfile } from "../services/userService";
import { toAbsoluteUrl } from "../services/uploadService";
import { ACHIEVEMENT_ICONS, getAchievement } from "../lib/achievements";
import Reveal from "../components/Reveal";
import BackButton from "../components/BackButton";
import EditProfileModal from "../components/EditProfileModal";

const TABS = [
    { key: "overview", label: "Overview" },
    { key: "builds", label: "Builds" },
    { key: "achievements", label: "Achievements" },
];

function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
}

export default function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { firebaseUser } = useAuth();
    const { me } = useMe();

    const isOwn = !id || (me && Number(id) === me.id);
    const targetId = id || me?.id;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("overview");
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        if (!targetId) return;
        let cancelled = false;
        setLoading(true);
        getProfile(targetId)
            .then((p) => !cancelled && setProfile(p))
            .catch((e) => !cancelled && setError(e.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [targetId]);

    if (!firebaseUser && !id) {
        return (
            <div className="text-center py-20">
                <p className="text-dim mb-4">Sign in to view your profile.</p>
                <button onClick={() => navigate("/login")} className="btn-primary">
                    Sign in
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

    if (error) {
        return (
            <div className="space-y-4">
                <BackButton label="Back" />
                <div className="border border-red-500/30 bg-red-500/10 p-5 text-[13px] text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const initial = (profile.displayName || "?").charAt(0).toUpperCase();
    const achCount = profile.achievements.length;
    const totalAchievements = Object.keys(ACHIEVEMENT_ICONS).length;

    return (
        <div className="space-y-6">
            <BackButton label="Back" />

            {/* ═══ BANNER + AVATAR ═══ */}
            <Reveal>
                <div className="relative">
                    {/* Banner */}
                    <div
                        className="relative h-48 sm:h-64 overflow-hidden border border-token"
                        style={
                            profile.bannerUrl
                                ? undefined
                                : {
                                    background:
                                        "linear-gradient(135deg, #ff1e79 0%, #8b2ff7 55%, #5b21b6 100%)",
                                }
                        }
                    >
                        {profile.bannerUrl ? (
                            <img
                                src={toAbsoluteUrl(profile.bannerUrl)}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-stripes opacity-70 pointer-events-none" />
                                <div className="absolute inset-0 bg-halftone opacity-30 pointer-events-none" />
                            </>
                        )}
                        {/* Fade for readability */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    {/* Avatar + name card */}
                    <div className="relative -mt-16 mx-6 sm:mx-8 border border-token bg-surface p-5 sm:p-6">
                        <div className="flex flex-wrap items-start gap-5">
                            {/* Avatar */}
                            <div
                                className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 border-4 border-surface overflow-hidden grid place-items-center font-display font-bold text-4xl text-white -mt-12 sm:-mt-16 shadow-2xl"
                                style={{ background: "linear-gradient(135deg, #ff1e79, #8b2ff7)" }}
                            >
                                {profile.avatarUrl ? (
                                    <img
                                        src={toAbsoluteUrl(profile.avatarUrl)}
                                        alt={profile.displayName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    initial
                                )}
                            </div>

                            {/* Name + meta */}
                            <div className="flex-1 min-w-0 mt-0 sm:mt-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h1 className="font-display text-2xl sm:text-3xl font-bold truncate">
                                        {profile.displayName || "Anonymous"}
                                    </h1>
                                    {profile.role === "ADMIN" && (
                                        <span className="text-[10.5px] font-mono uppercase tracking-wider px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-500">
                      Admin
                    </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-dim">
                                    <span>Member since {fmtDate(profile.createdAt)}</span>
                                    {profile.location && (
                                        <>
                                            <span className="opacity-40">·</span>
                                            <span className="inline-flex items-center gap-1">
                        <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                                                {profile.location}
                      </span>
                                        </>
                                    )}
                                    {profile.websiteUrl && (
                                        <>
                                            <span className="opacity-40">·</span>
                                            <a
                                                href={profile.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-pink hover:underline"
                                            >
                                                {profile.websiteUrl
                                                    .replace(/^https?:\/\//, "")
                                                    .replace(/\/$/, "")}
                                            </a>
                                        </>
                                    )}
                                </div>

                                {profile.bio && (
                                    <p className="text-[13.5px] text-dim mt-3 leading-relaxed max-w-2xl">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            {isOwn && (
                                <button
                                    onClick={() => setEditOpen(true)}
                                    className="btn-secondary !py-2 !px-4 !text-[13px] shrink-0"
                                >
                                    Edit profile
                                </button>
                            )}
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-token">
                            <Stat label="Total builds" value={profile.stats.totalBuilds} />
                            <Stat label="Public builds" value={profile.stats.publicBuilds} />
                            <Stat label="Comments written" value={profile.stats.totalComments} />
                            <Stat label="Comments received" value={profile.stats.commentsReceived} />
                        </div>
                    </div>
                </div>
            </Reveal>

            {/* ═══ TABS ═══ */}
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
                            {t.key === "achievements" && (
                                <span className="ml-1.5 text-[11px] font-mono text-dim">
                  {achCount}/{totalAchievements}
                </span>
                            )}
                            {t.key === "builds" && (
                                <span className="ml-1.5 text-[11px] font-mono text-dim">
                  {profile.builds.length}
                </span>
                            )}
                            {tab === t.key && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[color:var(--purple)]" />
                            )}
                        </button>
                    ))}
                </div>
            </Reveal>

            {/* ═══ TAB CONTENT ═══ */}
            {tab === "overview" && <OverviewTab profile={profile} />}
            {tab === "builds" && <BuildsTab builds={profile.builds} isOwn={isOwn} />}
            {tab === "achievements" && (
                <AchievementsTab achievements={profile.achievements} />
            )}

            {/* Edit modal */}
            <EditProfileModal
                open={editOpen}
                profile={profile}
                onClose={() => setEditOpen(false)}
                onSaved={setProfile}
            />
        </div>
    );
}

/* ═════════════════════════════════════════════ */

function Stat({ label, value }) {
    return (
        <div>
            <div className="font-display text-2xl font-bold">
                {value.toLocaleString()}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-dim mt-0.5">
                {label}
            </div>
        </div>
    );
}

function OverviewTab({ profile }) {
    const topAchievements = profile.achievements.slice(0, 4);
    const recentBuilds = profile.builds.slice(0, 4);

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent builds */}
            <Reveal delay={120} className="lg:col-span-2">
                <div className="border border-token bg-surface p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display font-semibold">Recent builds</h2>
                    </div>

                    {recentBuilds.length === 0 ? (
                        <div className="border border-dashed border-token p-10 text-center text-dim text-[13px]">
                            No builds yet.
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                            {recentBuilds.map((b) => (
                                <Link
                                    key={b.id}
                                    to={`/builds/${b.id}`}
                                    className="block border border-token bg-page p-4 hover:border-[color:var(--purple)] transition"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h3 className="font-display font-semibold text-[14px] truncate">
                                            {b.name}
                                        </h3>
                                        {b.isPublic ? (
                                            <span className="text-[9.5px] font-mono uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 px-1.5 py-0.5 shrink-0">
                        Public
                      </span>
                                        ) : (
                                            <span className="text-[9.5px] font-mono uppercase tracking-wider bg-surface border border-token text-dim px-1.5 py-0.5 shrink-0">
                        Private
                      </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-[12px] mt-3 pt-3 border-t border-token">
                    <span className="text-dim">
                      {b.components?.length || 0} parts
                    </span>
                                        <span className="font-display font-semibold text-pink">
                      {Number(b.totalPrice).toLocaleString()} SAR
                    </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </Reveal>

            {/* Achievements preview */}
            <Reveal delay={180}>
                <div className="border border-token bg-surface p-5">
                    <h2 className="font-display font-semibold mb-4">Achievements</h2>
                    {topAchievements.length === 0 ? (
                        <p className="text-dim text-[12.5px]">
                            No achievements yet — start building!
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {topAchievements.map((key) => {
                                const a = getAchievement(key);
                                return (
                                    <li key={key} className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 grid place-items-center shrink-0 border border-token"
                                            style={{ background: `${a.color}20`, color: a.color }}
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                {ACHIEVEMENT_ICONS[a.icon]}
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-display font-semibold text-[13px] truncate">
                                                {a.label}
                                            </div>
                                            <div className="text-[11px] text-dim truncate">{a.desc}</div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </Reveal>
        </div>
    );
}

function BuildsTab({ builds, isOwn }) {
    if (builds.length === 0) {
        return (
            <div className="border border-dashed border-token p-12 text-center">
                <p className="text-dim text-sm">
                    {isOwn ? "You haven't created any builds yet." : "No public builds yet."}
                </p>
            </div>
        );
    }
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {builds.map((b) => (
                <Link
                    key={b.id}
                    to={`/builds/${b.id}`}
                    className="border border-token bg-surface p-5 hover:border-[color:var(--purple)] transition"
                >
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-display font-semibold text-[15px] truncate">
                            {b.name}
                        </h3>
                        {b.isPublic ? (
                            <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 px-1.5 py-0.5 shrink-0">
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
              {b.components?.length || 0} parts
            </span>
                        <span className="font-display font-semibold text-[13.5px] text-pink">
              {Number(b.totalPrice).toLocaleString()} SAR
            </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function AchievementsTab({ achievements }) {
    const all = Object.keys(ACHIEVEMENT_ICONS);
    const unlocked = new Set(achievements);

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {all.map((key) => {
                const a = getAchievement(key);
                const has = unlocked.has(key);
                return (
                    <div
                        key={key}
                        className={`border p-5 transition ${
                            has
                                ? "border-token bg-surface"
                                : "border-dashed border-token bg-transparent opacity-50"
                        }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-12 h-12 grid place-items-center shrink-0 border border-token"
                                style={
                                    has
                                        ? {
                                            background: `${a.color}20`,
                                            color: a.color,
                                            borderColor: `${a.color}40`,
                                        }
                                        : { background: "var(--surface-2)", color: "var(--muted)" }
                                }
                            >
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {ACHIEVEMENT_ICONS[a.icon]}
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <div className="font-display font-semibold text-[14px] truncate">
                                    {a.label}
                                </div>
                                <div className="text-[11.5px] text-dim">
                                    {has ? "Unlocked" : "Locked"}
                                </div>
                            </div>
                        </div>
                        <p className="text-[12.5px] text-dim">{a.desc}</p>
                    </div>
                );
            })}
        </div>
    );
}