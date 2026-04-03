import { API } from "@/lib/axios";

export const loginApi = async (data: {
  email: string;
  password: string;
}) => {
  try {
    const res = await API.post("/api/login", data);
    return res.data; // axios returns data inside res.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Login failed");
  }
};