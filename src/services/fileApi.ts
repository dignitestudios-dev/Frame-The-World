import { API } from "@/lib/axios";
import axios from "axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MediaFileType = "image" | "video";

export type FileStatus =
  | "uploading"
  | "uploaded"
  | "processing"
  | "ready"
  | "rejected"
  | "flagged"
  | null;

export interface UploadUrlRequestItem {
  fileName: string;
  mimeType: string;
  type: MediaFileType;
}

export interface UploadUrlResponseItem {
  fileId: string;
  uploadUrl: string;
  key: string;
  type: MediaFileType;
  expiresAt: string;
}

export interface UploadUrlsResponse {
  success: boolean;
  message: string;
  data: {
    files: UploadUrlResponseItem[];
  };
}

export interface FileObject {
  _id: string;
  fileName?: string;
  key?: string;
  location?: string | null;
  type?: MediaFileType | null;
  status?: FileStatus;
  duration?: number | null;
  rejectionReason?: string | null;
  humanDetection?: {
    hasHuman: boolean | null;
    processedAt: string | null;
  };
  thumbnail?: FileObject | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompleteUploadResponse {
  success: boolean;
  message: string;
  data: {
    files: FileObject[];
  };
}

export interface GetFileResponse {
  success: boolean;
  message: string;
  data: FileObject;
}

// ─── Constants & Limits ──────────────────────────────────────────────────────

export const MEDIA_LIMITS = {
  MAX_IMAGE_SIZE_BYTES: 15 * 1024 * 1024, // 15MB
  MAX_VIDEO_SIZE_BYTES: 200 * 1024 * 1024, // 200MB
  MIN_VIDEO_DURATION_SECONDS: 10,
  MAX_VIDEO_DURATION_SECONDS: 60,
  ALLOWED_IMAGE_MIME_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
  ],
  ALLOWED_VIDEO_MIME_TYPES: [
    "video/mp4",
    "video/quicktime", // .mov
  ],
};

// ─── Core API Functions ──────────────────────────────────────────────────────

/**
 * Request pre-signed S3 PUT URLs for one or more files
 * POST /files/upload-urls
 */
export const requestUploadUrlsApi = async (
  files: UploadUrlRequestItem[]
): Promise<UploadUrlsResponse> => {
  const res = await API.post<UploadUrlsResponse>("/files/upload-urls", { files });
  return res.data;
};

/**
 * Upload raw file bytes directly to S3 via pre-signed PUT URL.
 * Attempts direct fetch first, and falls back to server upload proxy if browser CORS blocks it.
 */
export const uploadBytesToS3 = async (
  uploadUrl: string,
  file: File | Blob,
  mimeType: string,
  onProgress?: (percent: number) => void
): Promise<void> => {
  // Primary: Direct S3 PUT
  try {
    const directRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
      },
      body: file,
    });

    if (directRes.ok) {
      if (onProgress) onProgress(100);
      return;
    }

    const errText = await directRes.text().catch(() => "");
    throw new Error(
      `Direct storage upload returned ${directRes.status}: ${errText || directRes.statusText}`
    );
  } catch (directErr: any) {
    console.warn(
      "Direct storage upload encountered a network/CORS error. Attempting upload via local proxy fallback...",
      directErr
    );

    // Resilient Fallback: Stream to Next.js API server which relays to S3 (no browser CORS restrictions)
    const proxyRes = await fetch("/api/upload-s3", {
      method: "PUT",
      headers: {
        "x-upload-url": uploadUrl,
        "Content-Type": mimeType,
      },
      body: file,
    });

    if (proxyRes.ok) {
      if (onProgress) onProgress(100);
      return;
    }

    const proxyData = await proxyRes.json().catch(() => ({}));
    throw new Error(
      proxyData.message ||
        directErr.message ||
        "Failed to upload media to storage. Please check your connection and try again."
    );
  }
};

/**
 * Finalize uploads after client has PUT to S3
 * POST /files/complete
 */
export const completeUploadsApi = async (
  fileIds: string[]
): Promise<CompleteUploadResponse> => {
  const res = await API.post<CompleteUploadResponse>("/files/complete", { fileIds });
  return res.data;
};

/**
 * Poll a file's status (ownership-checked)
 * GET /files/:fileId
 */
export const getFileApi = async (fileId: string): Promise<GetFileResponse> => {
  const res = await API.get<GetFileResponse>(`/files/${fileId}`);
  return res.data;
};

// ─── Helpers & High-level Upload Orchestrator ────────────────────────────────

export interface UploadProgressCallback {
  (stage: "requesting_url" | "uploading_s3" | "completing" | "processing" | "ready", percent?: number, message?: string): void;
}

/**
 * Detect media type from file or mimeType
 */
export const detectMediaType = (file: File | { type: string; name?: string }): MediaFileType => {
  const mime = file.type?.toLowerCase() || "";
  const name = (file.name || "").toLowerCase();

  if (
    MEDIA_LIMITS.ALLOWED_VIDEO_MIME_TYPES.includes(mime) ||
    name.endsWith(".mp4") ||
    name.endsWith(".mov")
  ) {
    return "video";
  }
  return "image";
};

/**
 * Normalize MIME type for edge cases (e.g., .mov without explicit type)
 */
export const normalizeMimeType = (file: File): string => {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".heic")) return "image/heic";
  return "image/jpeg";
};

/**
 * Validate a media file before upload
 */
export const validateMediaFile = (file: File): { valid: boolean; error?: string; type: MediaFileType } => {
  const type = detectMediaType(file);
  const mimeType = normalizeMimeType(file);

  if (type === "image") {
    if (!MEDIA_LIMITS.ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `Unsupported image format. Allowed formats: JPG, PNG, WEBP, HEIC.`,
        type,
      };
    }
    if (file.size > MEDIA_LIMITS.MAX_IMAGE_SIZE_BYTES) {
      return {
        valid: false,
        error: `Image exceeds the 15MB upload limit. Please choose a smaller file.`,
        type,
      };
    }
  } else if (type === "video") {
    if (!MEDIA_LIMITS.ALLOWED_VIDEO_MIME_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `Unsupported video format. Allowed formats: MP4, MOV.`,
        type,
      };
    }
    if (file.size > MEDIA_LIMITS.MAX_VIDEO_SIZE_BYTES) {
      return {
        valid: false,
        error: `Video exceeds the 200MB upload limit. Please choose a smaller file.`,
        type,
      };
    }
  }

  return { valid: true, type };
};

/**
 * Poll video status until status is no longer "processing"
 */
export const pollVideoFileUntilReady = async (
  fileId: string,
  onPoll?: (file: FileObject) => void,
  intervalMs = 2500,
  maxAttempts = 120 // ~5 minutes max
): Promise<FileObject> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const fileRes = await getFileApi(fileId);
    const file = fileRes.data;

    if (onPoll) {
      onPoll(file);
    }

    if (file.status === "ready") {
      return file;
    }

    if (file.status === "rejected") {
      const reason = file.rejectionReason || "Video duration must be between 10 and 60 seconds.";
      const error = new Error(reason);
      (error as any).file = file;
      (error as any).status = "rejected";
      throw error;
    }

    if (file.status === "flagged") {
      const reason = file.rejectionReason || "A person was detected in the video. Please upload a video without people.";
      const error = new Error(reason);
      (error as any).file = file;
      (error as any).status = "flagged";
      throw error;
    }

    // Status is still processing or uploaded -> wait and poll again
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Video processing timed out. Please try again later.");
};

/**
 * End-to-end single media upload helper (Image or Video)
 */
export const uploadMediaFile = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<FileObject> => {
  // Step 0: Validate
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid file");
  }

  const mediaType = validation.type;
  const mimeType = normalizeMimeType(file);

  // Step 1: Request pre-signed URL
  onProgress?.("requesting_url", 0, "Requesting upload authorization...");
  const urlResponse = await requestUploadUrlsApi([
    {
      fileName: file.name,
      mimeType,
      type: mediaType,
    },
  ]);

  const uploadItem = urlResponse.data?.files?.[0];
  if (!uploadItem || !uploadItem.uploadUrl || !uploadItem.fileId) {
    throw new Error("Failed to obtain upload authorization URL.");
  }

  // Step 2: PUT directly to S3
  onProgress?.("uploading_s3", 0, "Uploading directly to storage...");
  await uploadBytesToS3(uploadItem.uploadUrl, file, mimeType, (pct) => {
    onProgress?.("uploading_s3", pct, `Uploading: ${pct}%`);
  });

  // Step 3: Complete upload
  onProgress?.("completing", 100, "Verifying upload...");
  const completeResponse = await completeUploadsApi([uploadItem.fileId]);
  const completedFile = completeResponse.data?.files?.[0];

  if (!completedFile) {
    throw new Error("Failed to finalize upload with server.");
  }

  // Step 4: If image, it is ready immediately
  if (completedFile.type === "image" || completedFile.status === "ready") {
    onProgress?.("ready", 100, "Upload ready!");
    return completedFile;
  }

  // Step 4 (Video): Poll until ready
  onProgress?.("processing", 100, "Validating duration & scanning video for humans...");
  const finalizedFile = await pollVideoFileUntilReady(uploadItem.fileId, (polled) => {
    onProgress?.("processing", 100, "Checking video criteria and human detection...");
  });

  onProgress?.("ready", 100, "Video verified & ready to post!");
  return finalizedFile;
};

/**
 * End-to-end multiple images upload helper for Personal Storage
 */
export const uploadMultipleImagesToS3 = async (
  files: File[],
  onProgress?: (completedCount: number, totalCount: number) => void
): Promise<FileObject[]> => {
  if (files.length === 0) return [];

  // Validate all images
  files.forEach((file) => {
    const val = validateMediaFile(file);
    if (!val.valid) throw new Error(val.error);
    if (val.type !== "image") throw new Error("Personal storage only accepts image files.");
  });

  // 1. Request upload URLs for all files
  const requestItems: UploadUrlRequestItem[] = files.map((file) => ({
    fileName: file.name,
    mimeType: normalizeMimeType(file),
    type: "image",
  }));

  const urlResponse = await requestUploadUrlsApi(requestItems);
  const uploadItems = urlResponse.data.files;

  if (uploadItems.length !== files.length) {
    throw new Error("Mismatch in generated upload URLs.");
  }

  // 2. PUT all files to S3 in parallel
  let completed = 0;
  await Promise.all(
    files.map(async (file, index) => {
      const item = uploadItems[index];
      const mime = normalizeMimeType(file);
      await uploadBytesToS3(item.uploadUrl, file, mime);
      completed++;
      onProgress?.(completed, files.length);
    })
  );

  // 3. Complete all uploads
  const fileIds = uploadItems.map((item) => item.fileId);
  const completeResponse = await completeUploadsApi(fileIds);

  return completeResponse.data.files;
};
