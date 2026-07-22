import api from "./api";

export const getChats = () => api.get("/api/message/get/conversation");
export const getMessages = (convoId) => api.get(`/api/message/get/conversation/${convoId}`);
export const createConversation = (receiverId) => api.post(`/api/message/create/conversation/${receiverId}`);
export const editMessage = (messageId, content) => api.patch(`/api/message/edit/${messageId}`, content, { headers: { "Content-Type": "text/plain" } });
export const deleteMessage = (messageId, deleteType) => api.delete(`/api/message/delete/${messageId}?deleteType=${deleteType}`);