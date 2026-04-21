import { API } from "@/lib/axios";

// POST /frames - FormData { cover, title, longitude, latitude, isPrivate, city, state, country }
export const createFrameApi = async (formData: FormData) => {
  const res = await API.post("/frames", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// GET /frames/own
export const getOwnFramesApi = async (params?: { page?: number; limit?: number; visibility?: string }) => {
  const res = await API.get("/frames/own", { params });
  return res.data;
};

// POST /frames/:frameId/posts
export const addPostToFrameApi = async (frameId: string, postId: string) => {
  const res = await API.post(`/frames/${frameId}/posts`, { postIds: [postId] });
  return res.data;
};

// PATCH /frames/:frameId - FormData { cover, title, longitude, latitude, isPrivate, city, state, country }
export const updateFrameApi = async (frameId: string, formData: FormData) => {
  const res = await API.patch(`/frames/${frameId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// DELETE /frames/:frameId
export const deleteFrameApi = async (frameId: string) => {
  const res = await API.delete(`/frames/${frameId}`);
  return res.data;
};

// DELETE /frames/:frameId/posts/:postId
export const removePostFromFrameApi = async (frameId: string, postId: string) => {
  const res = await API.delete(`/frames/${frameId}/posts/${postId}`);
  return res.data;
};
