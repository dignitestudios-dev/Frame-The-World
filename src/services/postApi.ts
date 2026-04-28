import { API } from "@/lib/axios";
import type { AxiosResponse } from "axios";

// POST /posts - FormData { image, caption, categories[0], categories[1], ... }
export const createPostApi = async (formData: FormData) => {
  const res = await API.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// GET /posts/:postId
export const getPostApi = async (postId: string) => {
  const res = await API.get(`/posts/${postId}`);
  return res.data;
};

// GET /posts/own
export const getOwnPostsApi = async (params?: { page?: number; limit?: number }) => {
  const res = await API.get("/posts/own", { params });
  return res.data;
};

// PATCH /posts/:postId
export const updatePostApi = async (postId: string, formData: FormData) => {
  const res = await API.patch(`/posts/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// DELETE /posts/:postId
export const deletePostApi = async (postId: string) => {
  const res = await API.delete(`/posts/${postId}`);
  return res.data;
};

// POST /posts/:postId/upvote
export const upvotePostApi = async (postId: string, payload?: { upvote: boolean }) => {
  const res = await API.post(`/posts/${postId}/upvote`, payload);
  return res.data;
};

// GET /posts/:postId/download
export const downloadPostApi = async (postId: string) => {
  const res = await API.get(`/posts/${postId}/download`);
  return res.data;
};

// GET /posts/:postId/insights?timeframe=week
export const getPostInsightsApi = async (postId: string, timeframe: string = "week") => {
  const res = await API.get(`/posts/${postId}/insights`, {
    params: { timeframe },
  });
  return res.data;
};
// POST /posts/:postId/remove-human
export const removeHumanApi = async (postId: string) => {
  const res = await API.post(`/posts/${postId}/remove-human`);
  return res.data;
};

// POST /posts/:postId/remove-human/:fileId
export const confirmRemoveHumanApi = async (postId: string, fileId: string) => {
  const res = await API.post(`/posts/${postId}/remove-human/${fileId}`);
  return res.data;
};

// GET /posts/all?longitude=&latitude=&categories=abc&categories=def
export const getAllPostsApi = async (params: {
  longitude?: number | string;
  latitude?: number | string;
  categories?: string[];
}) => {
  const queryParams = new URLSearchParams();
  if (params.longitude) queryParams.append("longitude", String(params.longitude));
  if (params.latitude) queryParams.append("latitude", String(params.latitude));
  if (params.categories && params.categories.length > 0) {
    params.categories.forEach((cat) => queryParams.append("categories", cat));
  }

  const res = await API.get(`/posts/all?${queryParams.toString()}`);
  return res.data;
};
