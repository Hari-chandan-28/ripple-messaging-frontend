import api from "./api";
import axios from "axios";

export const getMyProfile = (userId) => api.get(`/api/profile/${userId}`);

export const updateProfile = (data) => api.put("/api/profile/update", data);

export const updatePrivacy = (isPrivate) =>
    api.patch("/api/profile/privacy", { isPrivate });

export const uploadProfilePic = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/profile/upload-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
};