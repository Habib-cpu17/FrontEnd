import api from "../lib/api";

export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/api/uploads/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url; // e.g. "/uploads/avatars/uuid.jpg"
};

export const uploadBanner = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/api/uploads/banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
};

/** Prefix server-relative URLs with the API base */
export function toAbsoluteUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    const base = import.meta.env.VITE_API_BASE_URL || "";
    return `${base}${url}`;
}