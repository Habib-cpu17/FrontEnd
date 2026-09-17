import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken(); // auto-refreshes if near expiry
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: surface backend errors cleanly
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Request failed";
        return Promise.reject(new Error(message));
    }
);

export default api;