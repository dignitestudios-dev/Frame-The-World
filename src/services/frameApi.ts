import { API } from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FrameFeedItem = {
  _id: string;
  title: string;
  totalPosts: number;
  country?: string;
  state?: string;
  city?: string;
  geoLocation?: {
    type?: string;
    coordinates?: number[];
  };
  cover?: {
    _id?: string;
    fileName?: string;
    key?: string;
    location?: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  createdBy?: {
    _id?: string;
    name?: string;
    email?: string;
  }
};

export type FramesFeedResponse = {
  success: boolean;
  message: string;
  data: FrameFeedItem[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type FrameDetailsResponse = {
  success: boolean;
  message: string;
  data: FrameFeedItem;
};

export type FramePostItem = {
  _id: string;
  caption?: string | null;
  media?: {
    _id?: string;
    location?: string | null;
  } | null;
};

export type FramePostsResponse = {
  success: boolean;
  message: string;
  data: FramePostItem[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type FolderItem = {
  _id: string;
  name: string;
  userId?: string;
  noOfImages?: number;
  createdAt?: string;
  updatedAt?: string;
  cover?: {
    location?: string | null;
  } | null;
};

export type FoldersResponse = {
  success: boolean;
  message: string;
  data: FolderItem[];
  pagination?: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type FolderImageItem = {
  _id: string;
  filename: string;
  key: string;
  location: string;
  mimetype: string;
  size: number;
  uploadedById?: string;
  uploadedByModel?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FolderImagesResponse = {
  success: boolean;
  message: string;
  data: FolderImageItem[];
  pagination?: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

// ─── API Functions ────────────────────────────────────────────────────────────

// POST /frames - FormData { cover, title, longitude, latitude, isPrivate, city, state, country }
export const createFrameApi = async (formData: FormData) => {
  const res = await API.post("/frames", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// GET /frames - Frames feed listing with pagination
export const getFramesApi = async (params: { page: number; limit: number }) => {
  const res = await API.get<FramesFeedResponse>("/frames", { params });
  return res.data;
};

// GET /frames/:frameId - Single frame details
export const getFrameByIdApi = async (frameId: string) => {
  const res = await API.get<FrameDetailsResponse>(`/frames/${frameId}`);
  return res.data;
};

// GET /frames/:frameId/posts - Posts list by frame id
export const getFramePostsApi = async (
  frameId: string,
  params: { page?: number; limit?: number } = { page: 1, limit: 20 }
) => {
  const res = await API.get<FramePostsResponse>(`/frames/${frameId}/posts`, { params });
  return res.data;
};

// GET /frames - Search frames by location/categories/targetUserId
export const getSearchFramesApi = async (params: {
  latitude?: number | string;
  longitude?: number | string;
  categories?: string[];
  targetUserId?: string;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();

  if (typeof params.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }

  if (params.longitude) {
    searchParams.set("longitude", String(params.longitude));
  }

  if (params.latitude) {
    searchParams.set("latitude", String(params.latitude));
  }

  if (params.targetUserId) {
    searchParams.set("targetUserId", params.targetUserId);
  }

  params.categories?.forEach((category) => {
    searchParams.append("categories", category);
  });

  const queryString = searchParams.toString();
  const res = await API.get<FramesFeedResponse>(queryString ? `/frames/all?${queryString}` : "/frames/");
  return res.data;
};

// PATCH /frames/:frameId - FormData { cover?, title, longitude, latitude, isPrivate, city, state, country }
export const updateFrameApi = async (frameId: string, formData: FormData) => {
  const res = await API.patch(`/frames/${frameId}`, formData, {
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

// POST /folders - { name }
export const createFolderApi = async (data: { name: string }) => {
  const res = await API.post("/folders", data);
  return res.data;
};

// GET /folders - { page, limit }
export const getFoldersApi = async (params: { page: number; limit: number }) => {
  const res = await API.get<FoldersResponse>("/folders/own", { params });
  return res.data;
};

// GET /folders/:folderId/images - { page, limit }
export const getFolderImagesApi = async (
  folderId: string,
  params: { page?: number; limit?: number } = {}
) => {
  const res = await API.get<FolderImagesResponse>(`/folders/${folderId}/images`, { params });
  return res.data;
};

// POST /folders/:folderId/upload - FormData { image }
export const uploadImageToFolderApi = async (folderId: string, file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await API.post(`/folders/${folderId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// PATCH /folders/:folderId - { name }
export const renameFolderApi = async (folderId: string, data: { name: string }) => {
  const res = await API.patch(`/folders/${folderId}`, data);
  return res.data;
};

// DELETE /folders/:folderId
export const deleteFolderApi = async (folderId: string) => {
  const res = await API.delete(`/folders/${folderId}`);
  return res.data;
};

// DELETE /folders/:folderId/images  — body: { imageIds: [imageId] }
export const deleteFolderImageApi = async (folderId: string, imageId: string) => {
  const res = await API.delete(`/folders/${folderId}/images`, {
    data: { imageIds: [imageId] },
  });
  return res.data;
};

// POST /folders/:folderId/posts/:postId
export const movePostToFolderApi = async (folderId: string, postId: string) => {
  const res = await API.post(`/folders/${folderId}/posts/${postId}`);
  return res.data;
};
