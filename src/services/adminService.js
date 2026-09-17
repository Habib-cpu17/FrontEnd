import api from "../lib/api";

/* Components */
export const adminListComponents = async (page = 0, size = 30) => {
    const { data } = await api.get("/api/admin/components", { params: { page, size } });
    return data;
};

export const adminCreateComponent = async (payload) => {
    const { data } = await api.post("/api/admin/components", payload);
    return data;
};

export const adminUpdateComponent = async (id, payload) => {
    const { data } = await api.put(`/api/admin/components/${id}`, payload);
    return data;
};

export const adminSoftDeleteComponent = async (id) => {
    await api.delete(`/api/admin/components/${id}`);
};

export const adminSetComponentActive = async (id, active) => {
    const { data } = await api.patch(`/api/admin/components/${id}/active`, { active });
    return data;
};

/* Curated */
export const listCurated = async () => {
    const { data } = await api.get("/api/curated");
    return data;
};

export const adminAddCurated = async (buildId) => {
    await api.post(`/api/admin/curated/${buildId}`);
};

export const adminRemoveCurated = async (buildId) => {
    await api.delete(`/api/admin/curated/${buildId}`);
};

export const adminSetCuratedRank = async (buildId, rank) => {
    await api.patch(`/api/admin/curated/${buildId}/rank`, { rank });
};

/* Users */
export const adminListUsers = async (page = 0, size = 30) => {
    const { data } = await api.get("/api/admin/users", { params: { page, size } });
    return data;
};

export const adminUpdateUserRole = async (userId, role) => {
    const { data } = await api.patch(`/api/admin/users/${userId}/role`, { role });
    return data;
};

/* Builds (admin view) */
export const adminListBuilds = async (page = 0, size = 30) => {
    const { data } = await api.get("/api/builds/admin/all", { params: { page, size } });
    return data;
};
export const adminGetPriceProvider = async () => {
    const { data } = await api.get("/api/admin/prices/provider");
    return data.provider;
};

export const adminRefreshPrices = async () => {
    const { data } = await api.post("/api/admin/prices/refresh");
    return data; // { provider, changed }
};