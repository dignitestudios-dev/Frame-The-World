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

// GET /folders - { page, limit }
export const getFoldersApi = async (params: { page: number; limit: number }) => {
  const res = await API.get<FoldersResponse>("/folders/own", { params });
  return res.data;
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

// DELETE /folders/:folderId/images/:imageId
export const deleteFolderImageApi = async (folderId: string, imageId: string) => {
  const res = await API.delete(`/folders/${folderId}/images/${imageId}`);
  return res.data;
};
