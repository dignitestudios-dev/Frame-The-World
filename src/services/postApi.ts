import { API } from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PostMediaItem = {
  _id?: string;
  id?: string;
  fileName?: string;
  key?: string;
  location?: string | null;
  url?: string | null;
  type?: "image" | "video" | string | null;
  status?: string | null;
  duration?: number | null;
  thumbnail?: {
    location?: string | null;
    url?: string | null;
    _id?: string;
  } | null;
  aiDetection?: {
    isAI: boolean | null;
    processedAt?: string | null;
  } | null;
  humanDetection?: {
    hasHuman: boolean | null;
    processedAt?: string | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FeedPost = {
  _id: string;
  caption: string | null;
  media?: PostMediaItem[] | PostMediaItem | null;
  mediaType?: "image" | "video" | "mixed" | null;
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
  media?: PostMediaItem[] | PostMediaItem | null;
  mediaType?: "image" | "video" | "mixed" | null;
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
  media?: PostMediaItem[] | PostMediaItem | null;
  mediaType?: "image" | "video" | "mixed" | null;
  caption?: string | null;
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

export interface SinglePostItemPayload {
  caption?: string | null;
  categories: string[];
  media: string[]; // 1 to 10 file ids (ordered)
  country?: string;
  state?: string;
  latitude?: number | string;
  longitude?: number | string;
  isContentReleaseAccepted?: boolean;
}

export interface CreatePostsPayload {
  posts: SinglePostItemPayload[];
}

// Backwards-compatible type alias
export type CreatePostPayload = SinglePostItemPayload | CreatePostsPayload;

export interface UpdatePostPayload {
  caption?: string | null;
  categories?: string[];
  media?: string[]; // full new ordered list of 1-10 fileIds
  country?: string;
  state?: string;
  latitude?: number | string;
  longitude?: number | string;
  isContentReleaseAccepted?: boolean;
  status?: string;
}

export interface DownloadFileItem {
  filePath: string;
  fileName: string;
  type?: "image" | "video" | string;
}

export interface DownloadPostResponse {
  success: boolean;
  message: string;
  downloads?: number;
  data: {
    files: DownloadFileItem[];
    filePath?: string;
    fileName?: string;
    downloads?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

// POST /posts - Always sends { posts: [ ... ] } with media as an array of IDs
export const createPostApi = async (payload: CreatePostsPayload | SinglePostItemPayload | any) => {
  let body: { posts: any[] };

  if (payload && Array.isArray(payload.posts)) {
    body = {
      posts: payload.posts.map((item: any) => ({
        ...item,
        media: Array.isArray(item.media) ? item.media : [item.media].filter(Boolean),
      })),
    };
  } else if (payload) {
    const single = { ...payload };
    const mediaArray = Array.isArray(single.media)
      ? single.media
      : [single.media].filter(Boolean);
    single.media = mediaArray;
    body = { posts: [single] };
  } else {
    body = { posts: [] };
  }

  const res = await API.post("/posts", body);
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

// PATCH /posts/:postId - JSON { caption?, categories?, media: string[]?, country?, state?, ... }
export const updatePostApi = async (postId: string, payload: UpdatePostPayload | any) => {
  const normalizedPayload = { ...payload };
  if (normalizedPayload.media !== undefined) {
    normalizedPayload.media = Array.isArray(normalizedPayload.media)
      ? normalizedPayload.media
      : [normalizedPayload.media].filter(Boolean);
  }
  const res = await API.patch(`/posts/${postId}`, normalizedPayload);
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

// GET /posts/:postId/download - Returns data.files: DownloadFileItem[]
export const downloadPostApi = async (postId: string): Promise<DownloadPostResponse> => {
  const res = await API.get<DownloadPostResponse>(`/posts/${postId}/download`);
  return res.data;
};

// GET /posts/:postId/insights?timeframe=week
export const getPostInsightsApi = async (postId: string, timeframe: string = "week") => {
  const res = await API.get(`/posts/${postId}/insights`, {
    params: { timeframe },
  });
  return res.data;
};

// POST /posts/:postId/media/:mediaId/remove-human (Step A: Generate candidate)
export const removeHumanApi = async (postId: string, mediaId?: string) => {
  const url = mediaId
    ? `/posts/${postId}/media/${mediaId}/remove-human`
    : `/posts/${postId}/remove-human`;
  const res = await API.post(url);
  return res.data;
};

// POST /posts/:postId/media/:mediaId/remove-human/:newFileId (Step B: Swap in)
export const confirmRemoveHumanApi = async (
  postId: string,
  mediaIdOrFileId: string,
  newFileId?: string
) => {
  const url = newFileId
    ? `/posts/${postId}/media/${mediaIdOrFileId}/remove-human/${newFileId}`
    : `/posts/${postId}/remove-human/${mediaIdOrFileId}`;
  const res = await API.post(url);
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
