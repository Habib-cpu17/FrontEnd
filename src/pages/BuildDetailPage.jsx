import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteBuild, getBuild } from "../services/buildService";
import { addComment, deleteComment, listComments } from "../services/commentService";
import { useAuth } from "../context/AuthContext";
import { useMe } from "../hooks/useMe";
import { toAbsoluteUrl } from "../services/uploadService";
import Reveal from "../components/Reveal";
import BackButton from "../components/BackButton";

export default function BuildDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { firebaseUser } = useAuth();
    const { me } = useMe();

    const [build, setBuild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [posting, setPosting] = useState(false);
    const [commentError, setCommentError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getBuild(id)
            .then((b) => !cancelled && setBuild(b))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        let cancelled = false;
        setCommentsLoading(true);
        listComments(id, 0, 50)
            .then((res) => !cancelled && setComments(res.content || []))
            .catch(() => !cancelled && setComments([]))
            .finally(() => !cancelled && setCommentsLoading(false));
        return () => {
            cancelled = true;
        };
    }, [id]);

    const onDelete = async () => {
        if (!confirm("Delete this build? This cannot be undone.")) return;
        setDeleting(true);
        try {
            await deleteBuild(id);
            navigate("/my-builds");
        } catch (err) {
            alert(err.message);
            setDeleting(false);
        }
    };

    const onPostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setPosting(true);
        setCommentError("");
        try {
            const created = await addComment(id, newComment.trim());
            setComments((prev) => [created, ...prev]);
            setNewComment("");
        } catch (err) {
            setCommentError(err.message);
        } finally {
            setPosting(false);
        }
    };

    const onDeleteComment = async (commentId) => {
        if (!confirm("Delete this comment?")) return;
        try {
            await deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (err) {
            alert(err.message);
        }
    };

    const formatDate = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        const diff = (new Date() - d) / 1000;
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return d.toLocaleDateString();
    };

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

    if (!build) return null;
    const isOwner = me && build.userId === me.id;

    return (
        <div className="space-y-8">
            <BackButton label="Back to builds" />

            {/* ═══ HERO ═══ */}
            <Reveal>
                <div className="border border-token bg-surface p-8">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                                {build.isPublic ? (
                                    <span className="text-[10.5px] font-mono uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 px-2 py-0.5">
                    Public
                  </span>
                                ) : (
                                    <span className="text-[10.5px] font-mono uppercase tracking-wider bg-page border border-token text-dim px-2 py-0.5">
                    Private
                  </span>
                                )}
                                <span className="text-[11px] font-mono text-dim">
                  #{String(build.id).padStart(4, "0")}
                </span>
                            </div>

                            <h1 className="font-display text-3xl md:text-4xl font-bold">
                                {build.name}
                            </h1>
                            <p className="text-[13px] text-dim mt-2">
                                by{" "}
                                {build.userId ? (
                                    <Link
                                        to={`/users/${build.userId}`}
                                        className="text-pink hover:underline"
                                    >
                                        {build.userDisplayName || "Anonymous"}
                                    </Link>
                                ) : (
                                    <span className="text-body">
                    {build.userDisplayName || "Anonymous"}
                  </span>
                                )}
                            </p>
                            {build.description && (
                                <p className="mt-4 text-[14px] text-dim max-w-2xl leading-relaxed">
                                    {build.description}
                                </p>
                            )}
                        </div>

                        {isOwner && (
                            <div className="flex gap-2 shrink-0">
                                <Link
                                    to={`/builder/${build.id}`}
                                    className="btn-secondary !py-2 !px-3.5 !text-[13px]"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={onDelete}
                                    disabled={deleting}
                                    className="text-[13px] font-medium px-3.5 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition"
                                >
                                    {deleting ? "Deleting…" : "Delete"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Reveal>

            {/* ═══ WARNINGS ═══ */}
            {build.compatibilityWarnings?.length > 0 && (
                <Reveal delay={80}>
                    <div className="border border-amber-500/30 bg-amber-500/[0.06] p-5">
                        <div className="font-semibold text-amber-600 dark:text-amber-400 mb-3 text-[13px]">
                            Compatibility warnings
                        </div>
                        <ul className="space-y-1.5 text-[13px] text-amber-700 dark:text-amber-300/90 list-disc list-inside">
                            {build.compatibilityWarnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    </div>
                </Reveal>
            )}

            {/* ═══ COMPONENTS + TOTAL ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Reveal delay={120} className="lg:col-span-2">
                    <div className="border border-token bg-surface divide-y divide-[color:var(--border)]">
                        {build.components.map((c) => (
                            <div
                                key={c.id}
                                className="p-5 flex items-center justify-between hover:bg-page transition"
                            >
                                <div className="min-w-0">
                                    <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-accent">
                                        {c.component.category.replace("_", " ")}
                                    </div>
                                    <div className="font-display font-semibold text-[14.5px] mt-1 truncate">
                                        {c.component.name}
                                    </div>
                                    <div className="text-[12px] text-dim mt-0.5">
                                        {c.component.brand}
                                        {c.component.model ? ` · ${c.component.model}` : ""}
                                        {c.quantity > 1 && ` · qty ${c.quantity}`}
                                    </div>
                                </div>
                                <div className="text-right shrink-0 pl-4">
                                    <div className="text-[11.5px] text-dim font-mono">
                                        {Number(c.priceAtTimeOfBuild).toLocaleString()} ea
                                    </div>
                                    <div className="font-display font-bold text-[14px] text-pink">
                                        {Number(c.lineTotal).toLocaleString()} SAR
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Reveal>

                <Reveal delay={180}>
                    <div className="sticky top-20 border border-token bg-surface p-6">
                        <div className="eyebrow mb-2">Total</div>
                        <div className="text-right">
              <span className="font-display text-4xl font-bold">
                {Number(build.totalPrice).toLocaleString()}
              </span>
                            <span className="text-[13px] text-dim ml-2">SAR</span>
                        </div>
                        <div className="text-[12px] text-dim mt-3 pt-3 border-t border-token">
                            {build.components.length} component
                            {build.components.length === 1 ? "" : "s"} · {comments.length} comment
                            {comments.length === 1 ? "" : "s"}
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* ═══ COMMENTS ═══ */}
            <Reveal delay={220}>
                <div className="border border-token bg-surface p-6">
                    <h2 className="font-display text-lg font-semibold mb-5">
                        Comments{" "}
                        <span className="text-dim font-normal text-[13px]">
              ({comments.length})
            </span>
                    </h2>

                    {/* Add comment */}
                    {firebaseUser ? (
                        <form onSubmit={onPostComment} className="mb-6">
              <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this build…"
                  rows={3}
                  maxLength={2000}
                  className="w-full px-3 py-2.5 text-[13.5px] bg-page border border-token text-body placeholder:text-dim resize-none focus:outline-none focus:border-[color:var(--purple)] focus:ring-2 focus:ring-[color:var(--purple)]/15 transition"
              />
                            <div className="flex items-center justify-between mt-2.5">
                <span className="text-[11.5px] text-dim">
                  {newComment.length}/2000
                </span>
                                <button
                                    type="submit"
                                    disabled={posting || !newComment.trim()}
                                    className="btn-primary !py-2 !px-4 !text-[13px] disabled:opacity-40"
                                >
                                    {posting ? "Posting…" : "Post comment"}
                                </button>
                            </div>
                            {commentError && (
                                <div className="mt-2 text-[12.5px] text-red-500 bg-red-500/10 border border-red-500/30 p-2">
                                    {commentError}
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className="mb-6 border border-token bg-page p-3.5 text-[13px] text-dim">
                            <Link to="/login" className="text-pink hover:underline">
                                Sign in
                            </Link>{" "}
                            to leave a comment.
                        </div>
                    )}

                    {/* Comment list */}
                    {commentsLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 border border-token bg-page animate-pulse"
                                />
                            ))}
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="border border-dashed border-token p-8 text-center">
                            <p className="text-dim text-[13px]">
                                No comments yet. Be the first.
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-5">
                            {comments.map((c) => {
                                const canDelete = me && c.userId === me.id;
                                const initial = (c.userDisplayName || "?").charAt(0).toUpperCase();
                                return (
                                    <li key={c.id} className="flex gap-3 group">
                                        {/* Avatar */}
                                        <Link
                                            to={`/users/${c.userId}`}
                                            className="w-10 h-10 shrink-0 overflow-hidden grid place-items-center font-display font-semibold text-[14px] text-white border border-token"
                                            style={{ background: "linear-gradient(135deg, #ff1e79, #8b2ff7)" }}
                                        >
                                            {c.userAvatarUrl ? (
                                                <img
                                                    src={toAbsoluteUrl(c.userAvatarUrl)}
                                                    alt={c.userDisplayName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                initial
                                            )}
                                        </Link>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <Link
                                                    to={`/users/${c.userId}`}
                                                    className="font-display font-semibold text-[13.5px] hover:text-pink transition"
                                                >
                                                    {c.userDisplayName || "Anonymous"}
                                                </Link>
                                                <span className="text-[11px] text-dim font-mono">
                          {formatDate(c.createdAt)}
                        </span>
                                                {canDelete && (
                                                    <button
                                                        onClick={() => onDeleteComment(c.id)}
                                                        className="ml-auto text-[11.5px] text-dim hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[13.5px] opacity-85 mt-1 whitespace-pre-wrap break-words">
                                                {c.content}
                                            </p>
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