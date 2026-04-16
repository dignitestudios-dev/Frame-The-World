import { API } from "@/lib/axios";

// GET /frames/own
export const getOwnFramesApi = async (params?: { page?: number; limit?: number; visibility?: string }) => {
  const res = await API.get("/frames/own", { params });
  return res.data;
};
