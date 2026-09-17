import api from "../lib/api";

export const listComments = async (buildId, page = 0, size = 20) => {
    const { data } = await api.get(`/api/builds/${buildId}/comments`, {
        params: { page, size },
    });
    return data;
};

export const addComment = async (buildId, content) => {
    const { data } = await api.post(`/api/builds/${buildId}/comments`, { content });
    return data;
};

export const deleteComment = async (commentId) => {
    await api.delete(`/api/comments/${commentId}`);
};