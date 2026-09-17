import api from "../lib/api";

export const getProfile = async (userId) => {
    const { data } = await api.get(`/api/users/${userId}`);
    return data;
};

export const getMyProfile = async () => {
    const { data } = await api.get("/api/users/me/profile");
    return data;
};

export const updateMyProfile = async (payload) => {
    const { data } = await api.put("/api/users/me/profile", payload);
    return data;
};