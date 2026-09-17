import api from "../lib/api";

export const listComponents = async ({ category, search, brand, page = 0, size = 24 } = {}) => {
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (brand) params.brand = brand;
    params.page = page;
    params.size = size;

    const { data } = await api.get("/api/components", { params });
    return data; // Page<ComponentResponse>
};

export const getComponent = async (id) => {
    const { data } = await api.get(`/api/components/${id}`);
    return data;
};