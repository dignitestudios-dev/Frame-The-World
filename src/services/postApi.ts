import { API } from "@/lib/axios";

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
