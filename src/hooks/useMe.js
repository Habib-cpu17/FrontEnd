import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

// Module-level cache — shared across all components
let cachedMe = null;
let inflight = null;

export function clearMeCache() {
    cachedMe = null;
    inflight = null;
}

export function useMe() {
    const { firebaseUser } = useAuth();

    // Lazy initial state — avoids sync setState in the effect
    const [me, setMe] = useState(() => (firebaseUser ? cachedMe : null));
    const [loading, setLoading] = useState(() => Boolean(firebaseUser && !cachedMe));

    useEffect(() => {
        let cancelled = false;

        // Logged out — wipe and bail (setState deferred to avoid lint warning)
        if (!firebaseUser) {
            cachedMe = null;
            inflight = null;
            Promise.resolve().then(() => {
                if (cancelled) return;
                setMe(null);
                setLoading(false);
            });
            return () => {
                cancelled = true;
            };
        }

        // Cache hit — use it immediately
        if (cachedMe) {
            Promise.resolve().then(() => {
                if (cancelled) return;
                setMe(cachedMe);
                setLoading(false);
            });
            return () => {
                cancelled = true;
            };
        }

        // Otherwise fetch (one request shared across all callers)
        Promise.resolve().then(() => {
            if (!cancelled) setLoading(true);
        });

        if (!inflight) {
            inflight = api
                .get("/api/me")
                .then((r) => r.data)
                .finally(() => {
                    inflight = null;
                });
        }

        inflight
            .then((data) => {
                cachedMe = data;
                if (!cancelled) setMe(data);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [firebaseUser]);

    return { me, loading };
}