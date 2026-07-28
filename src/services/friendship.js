import api from "./api";

export const getFriends = () => api.get("/api/friendship/friends");
export const getPending = () => api.get("/api/friendship/pending");
export const sendRequest = (userId) => api.post(`/api/friendship/request/${userId}`);
export const acceptRequest = (userId) => api.put(`/api/friendship/accept/${userId}`);
export const rejectRequest = (userId) => api.delete(`/api/friendship/reject/${userId}`);
export const removeFriend = (userId) => api.delete(`/api/friendship/remove/${userId}`);
export const searchUsers = (username) => api.get(`/api/search/profile?username=${username}`);
export const takebackRequest = (userId) => api.delete(`/api/friendship/takeback/${userId}`);