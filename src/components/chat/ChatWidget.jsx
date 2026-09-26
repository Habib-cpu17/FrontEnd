import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../context/LanguageContext";
import {
    createSession,
    sendMessage,
} from "../../services/chatService";

export default function ChatWidget() {
    const { t, n } = useLang();
    const { firebaseUser } = useAuth();
    const [open, setOpen] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);

    const SUGGESTIONS = [
        { key: "chat.suggestionPc", budget: 6000 },
        { key: "chat.suggestionCpu" },
        { key: "chat.suggestionDdr" },
        { key: "chat.suggestionGpu", budget: 1500 },
    ];

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, sending]);

    // Start a new session the first time the widget opens
    const startNewChat = async () => {
        setMessages([]);
        setSessionId(null);
        setError("");
        try {
            const session = await createSession();
            setSessionId(session.id);
        } catch {
            setError(t("chat.failedToStart"));
        }
    };

    useEffect(() => {
        if (open && !sessionId && !loading) {
            setLoading(true);
            createSession()
                .then((s) => setSessionId(s.id))
                .catch(() => setError(t("chat.failedToStart")))
                .finally(() => setLoading(false));
        }
    }, [open, sessionId, loading, t]);

    if (!firebaseUser) return null;

    const onSend = async (text) => {
        const trimmed = (text ?? input).trim();
        if (!trimmed || !sessionId) return;

        setInput("");
        setError("");
        const userMsg = { id: `u-${Date.now()}`, role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setSending(true);

        try {
            const reply = await sendMessage(sessionId, trimmed);
            setMessages((prev) => [...prev, reply]);
        } catch {
            setError(t("chat.failedToSend"));
            setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const clearChat = async () => {
        if (!confirm(t("chat.confirmNewChat"))) return;
        await startNewChat();
    };

    return (
        <>
            {/* Floating button */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 grid place-items-center text-white shadow-2xl transition hover:scale-105"
                style={{
                    background: "linear-gradient(135deg, var(--pink), var(--purple))",
                    boxShadow: "0 8px 32px rgba(233, 30, 121, 0.4)",
                }}
                aria-label={t("chat.openAssistant")}
            >
                {open ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" />
                    </svg>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div
                    className="fixed bottom-24 right-6 z-40 w-[min(400px,calc(100vw-3rem))] h-[600px] max-h-[calc(100vh-7rem)] flex flex-col border border-token bg-surface shadow-2xl slide-in-right"
                    style={{ boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)" }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-token">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 grid place-items-center text-white"
                                 style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-display font-semibold text-[13.5px] leading-tight">
                                    {t("chat.title")}
                                </div>
                                <div className="text-[10.5px] text-dim leading-tight">
                                    {t("chat.subtitle")}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={clearChat}
                                title={t("chat.newChat")}
                                className="w-8 h-8 grid place-items-center text-dim hover:text-pink transition"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading && (
                            <div className="text-center text-[12px] text-dim py-8">{t("chat.starting")}</div>
                        )}

                        {!loading && messages.length === 0 && (
                            <div className="space-y-3">
                                <p className="text-[13px] text-dim">
                                    {t("chat.welcome")}
                                </p>
                                <div className="space-y-1.5">
                                    {SUGGESTIONS.map((s) => {
                                        const label = t(s.key, s.budget ? { budget: n(s.budget) } : undefined);
                                        return (
                                            <button
                                                key={s.key}
                                                type="button"
                                                onClick={() => onSend(label)}
                                                className="w-full text-start text-[12.5px] px-3 py-2 border border-token hover:border-[color:var(--purple)] hover:bg-page transition"
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                                        m.role === "user"
                                            ? "text-white"
                                            : "border border-token bg-page"
                                    }`}
                                    style={
                                        m.role === "user"
                                            ? { background: "linear-gradient(135deg, var(--pink), var(--purple))" }
                                            : undefined
                                    }
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {sending && (
                            <div className="flex justify-start">
                                <div className="border border-token bg-page px-3.5 py-2.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--purple)] animate-pulse" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--purple)] animate-pulse" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--purple)] animate-pulse" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="text-[12px] text-red-500 bg-red-500/10 border border-red-500/30 p-2">
                                {error}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-token p-3">
                        <div className="flex items-end gap-2">
              <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={t("chat.placeholder")}
                  rows={1}
                  maxLength={2000}
                  disabled={sending || !sessionId}
                  className="flex-1 px-3 py-2 text-[13px] bg-page border border-token text-body placeholder:text-dim resize-none focus:outline-none focus:border-[color:var(--purple)] focus:ring-2 focus:ring-[color:var(--purple)]/15 transition disabled:opacity-50"
                  style={{ maxHeight: "120px" }}
              />
                            <button
                                type="button"
                                onClick={() => onSend()}
                                disabled={sending || !input.trim() || !sessionId}
                                className="w-10 h-10 grid place-items-center text-white disabled:opacity-40 transition hover:scale-105"
                                style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}
                                aria-label={t("chat.send")}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}