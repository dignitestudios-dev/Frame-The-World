import { API } from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FeedPost = {
  _id: string;
  caption: string | null;
  media?: {
    location?: string | null;
  } | null;
};

export type FeedPostsResponse = {
  success: boolean;
  message: string;
  data: FeedPost[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type FeaturedPost = {
  _id: string;
  status?: string;
  media?: {
    _id?: string;
    fileName?: string;
    key?: string;
    location?: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FeaturedPostsResponse = {
  success: boolean;
  message: string;
  data: FeaturedPost[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type SearchPostItem = {
  _id: string;
  media?: {
    location?: string | null;
  } | null;
};

export type SearchPostsResponse = {
  success: boolean;
  message: string;
  data: SearchPostItem[];
  pagination?: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type SearchCommonParams = {
  latitude?: number | string;
  longitude?: number | string;
  categories?: string[];
  userId?: string;
  targetUserId?: string;
};

export type LeaderboardUser = {
  upvotes?: number;
  downloads?: number;
  user: {
    _id: string;
    name: string | null;
    profilePicture?: {
      location: string;
    } | null;
  };
  rank: number;
};

export type LeaderboardResponse = {
  success: boolean;
  message: string;
  data: {
    topUpvotedUsers: LeaderboardUser[];
    topDownloadedUsers: LeaderboardUser[];
  };
};

// ─── API Functions ────────────────────────────────────────────────────────────

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

// GET /posts - Feed listing with pagination
export const getPostsApi = async (params: { page: number; limit: number }) => {
  const res = await API.get<FeedPostsResponse>("/posts", { params });
  return res.data;
};

// GET /posts/featured - Featured feed listing with pagination
export const getFeaturedPostsApi = async (params: { page: number; limit: number }) => {
  const res = await API.get<FeaturedPostsResponse>("/posts/featured", { params });
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

// GET /posts/all - Search posts by location/categories/userId
export const getSearchPostsApi = async (params: SearchCommonParams & { limit?: number; page?: number }) => {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(params.limit ?? 40));

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.longitude) {
    searchParams.set("longitude", String(params.longitude));
  }

  if (params.latitude) {
    searchParams.set("latitude", String(params.latitude));
  }

  if (params.userId || params.targetUserId) {
    searchParams.set("targetUserId", params.userId || params.targetUserId || "");
  }

  params.categories?.forEach((category) => {
    searchParams.append("categories", category);
  });

  const res = await API.get<SearchPostsResponse>(`/posts/all?${searchParams.toString()}`);
  return res.data;
};

// GET /posts/leaderboard
export const getLeaderboardApi = async () => {
  const res = await API.get<LeaderboardResponse>(`/posts/leaderboard`);
  return res.data;
};

// POST /ai-caption/generate
export const generateAiCaptionApi = async (formData: FormData) => {
  const res = await API.post("/ai-caption/generate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// GET /categories - { page, limit }
export const getCategoriesApi = async (params?: { page?: number; limit?: number }) => {
  const res = await API.get("/categories", { params });
  return res.data;
};
