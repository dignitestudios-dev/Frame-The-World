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
