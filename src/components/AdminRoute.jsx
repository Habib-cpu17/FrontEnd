import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useMe } from "../hooks/useMe";

export default function AdminRoute({ children }) {
    const { firebaseUser, loading: authLoading } = useAuth();
    const { t } = useLang();
    const { me, loading: meLoading } = useMe();

    if (authLoading || (firebaseUser && meLoading)) {
        return (
            <div className="min-h-[60vh] grid place-items-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                         style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
                    <p className="text-[12.5px] text-dim">{t("auth.checkingPermissions")}</p>
                </div>
            </div>
        );
    }

    if (!firebaseUser) return <Navigate to="/login" replace />;
    if (me?.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

    return children;
}