import api from "./api";

export const getMyProfile = (userId) => api.get(`/api/profile/${userId}`);
export const updateProfile = (data) => api.put("/api/profile/update", data);
export const updatePrivacy = (isPrivate) => api.patch("/api/profile/privacy", { isPrivate });