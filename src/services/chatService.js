import api from "../lib/api";

export const createSession = async () => {
    const { data } = await api.post("/api/chat/sessions");
    return data;
};

export const listSessions = async (page = 0, size = 20) => {
    const { data } = await api.get("/api/chat/sessions", { params: { page, size } });
    return data;
};

export const deleteSession = async (id) => {
    await api.delete(`/api/chat/sessions/${id}`);
};

export const listMessages = async (sessionId) => {
    const { data } = await api.get(`/api/chat/sessions/${sessionId}/messages`);
    return data;
};

export const sendMessage = async (sessionId, content) => {
    const { data } = await api.post(`/api/chat/sessions/${sessionId}/messages`, { content });
    return data;
};