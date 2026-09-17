import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const push = useCallback((message, type = "success") => {
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, message, type }]);
        setTimeout(() => {
            setToasts((t) => t.filter((x) => x.id !== id));
        }, 2600);
    }, []);

    const toast = {
        success: (msg) => push(msg, "success"),
        error: (msg) => push(msg, "error"),
        info: (msg) => push(msg, "info"),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] space-y-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="toast-in pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-medium shadow-2xl min-w-[240px] max-w-sm"
                        style={{
                            background:
                                t.type === "success"
                                    ? "linear-gradient(135deg, #10b981, #059669)"
                                    : t.type === "error"
                                        ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                        : "linear-gradient(135deg, var(--pink), var(--purple))",
                            color: "#fff",
                            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
                        }}
                    >
                        {t.type === "success" && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                        <span className="flex-1">{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}