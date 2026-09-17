import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            await register(email, password, displayName);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setBusy(false);
        }
    };

    const inputCls =
        "w-full rounded-lg px-3 py-2.5 text-[14px] bg-page border border-token text-body placeholder:text-dim focus:outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/15 transition";

    return (
        <div className="min-h-screen bg-page text-body">
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="min-h-screen grid place-items-center px-4 py-10">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-md grid place-items-center bg-[color:var(--text)]">
                            <div className="w-3 h-3 rounded-sm bg-[color:var(--bg)]" />
                        </div>
                        <span className="font-display font-bold tracking-tight text-[15px]">
              Setup Builder
            </span>
                    </Link>

                    <form
                        onSubmit={onSubmit}
                        className="rounded-2xl border border-token bg-surface p-8 space-y-5"
                    >
                        <div>
                            <h1 className="font-display text-2xl font-bold">Create your account</h1>
                            <p className="text-[13px] text-dim mt-1">
                                Free. No credit card. Start building in seconds.
                            </p>
                        </div>

                        {error && (
                            <div className="text-[13px] rounded-lg p-2.5 bg-red-500/10 border border-red-500/30 text-red-500">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="text-[12px] text-dim mb-1.5 block">Display name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className={inputCls}
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="text-[12px] text-dim mb-1.5 block">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={inputCls}
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="text-[12px] text-dim mb-1.5 block">
                                    Password <span className="opacity-50">(min 6 chars)</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className={inputCls}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
                            {busy ? "Creating account…" : "Create account"}
                        </button>

                        <p className="text-[13px] text-dim text-center">
                            Already have an account?{" "}
                            <Link to="/login" className="text-accent hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>

                    <Link to="/" className="block text-center mt-6 text-[12.5px] text-dim hover:opacity-80 transition">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}