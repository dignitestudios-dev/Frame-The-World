import { API } from "@/lib/axios";

// GET /blocks - Get all blocked users
export const getBlockedUsersApi = async () => {
  const res = await API.get("/blocks");
  return res?.data;
};

// DELETE /blocks/:userId - Block/Unblock a user
// Same API handles both block and unblock operations
export const toggleBlockUserApi = async (userId: string) => {
  const res = await API.post(`/blocks/${userId}`);
  return res?.data;
};
export const toggleUnblockedUserApi = async (userId: string) => {
  const res = await API.delete(`/blocks/${userId}`);
  return res?.data;
};
