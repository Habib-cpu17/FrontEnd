import api from "../lib/api";

export const createBuild = async (payload) => {
    const { data } = await api.post("/api/builds", payload);
    return data;
};

export const updateBuild = async (id, payload) => {
    const { data } = await api.put(`/api/builds/${id}`, payload);
    return data;
};

export const getBuild = async (id) => {
    const { data } = await api.get(`/api/builds/${id}`);
    return data;
};

export const listMyBuilds = async (page = 0, size = 20) => {
    const { data } = await api.get("/api/builds/mine", { params: { page, size } });
    return data;
};

export const listPublicBuilds = async (page = 0, size = 20) => {
    const { data } = await api.get("/api/builds/public", { params: { page, size } });
    return data;
};

export const deleteBuild = async (id) => {
    await api.delete(`/api/builds/${id}`);
};

export const checkCompatibility = async (components) => {
    const { data } = await api.post("/api/builds/check", {
        name: "check",
        components,
    });
    return data.warnings || [];
};
export const estimatePriceWithAi = async (buildId) => {
    const { data } = await api.post(`/api/builds/${buildId}/ai-estimate`);
    return data; // { estimatedTotal, marketCondition, explanation, databaseTotal, percentDifference }
};
