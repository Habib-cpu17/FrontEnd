import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { clearMeCache } from "../hooks/useMe";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setFirebaseUser(u);
            setLoading(false);
        });
        return unsub;
    }, []);

    const register = async (email, password, displayName) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(cred.user, { displayName });
            // Force refresh so the ID token contains the new displayName
            await cred.user.getIdToken(true);
        }
        return cred.user;
    };

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const logout = async () => {
        clearMeCache();
        await signOut(auth);
    };

    const value = { firebaseUser, loading, register, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
