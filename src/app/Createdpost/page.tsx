"use client";

import Image from "next/image";
import Header from "@/components/global/header";
import React, { useEffect, useState, Suspense, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { createPostApi, getCategoriesApi } from "@/services/postApi";
import {
  uploadMixedMediaFiles,
  validateMediaFile,
  MEDIA_LIMITS,
  MediaFileType,
  FileObject,
} from "@/services/fileApi";
import { CategoryChipSkeleton } from "@/components/global/Skeletons";
import { useRouter, useSearchParams } from "next/navigation";
import ContentReleaseModal from "@/components/global/ContentReleaseModal";
import Link from "next/link";
import ImportFolderModal from "@/components/createpost/ImportFolderModal";
import VideoTrimModal from "@/components/createpost/VideoTrimModal";
import TrialLimitModal from "@/components/global/TrialLimitModal";
import { FolderImageItem } from "@/services/frameApi";
import { isTrialLimitError, getApiErrorMessage } from "@/lib/apiError";
import { useAccessControl } from "@/providers/AccessControlProvider";
import {
  Loader2,
  Film,
  Image as ImageIcon,
  AlertCircle,
  Scissors,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Star,
  Layers,
  Images,
  X,
} from "lucide-react";
import LocationAutocomplete, {
  PlaceSelectionDetails,
} from "@/components/global/LocationAutocomplete";

export interface MediaItemDraft {
  id: string; // unique draft ID for keys
  file: File | null; // null if imported from storage
  fileId: string | null; // non-null if imported from storage or already on server
  previewUrl: string;
  mediaType: MediaFileType;
  videoDuration?: number | null;
  name: string;
}

export interface PostDraft {
  id: string;
  mediaItems: MediaItemDraft[];
  activeMediaIndex: number;
  caption: string;
  selectedCategories: string[];
  location: string;
  locationData: PlaceSelectionDetails | null;
  locationError?: string;
}

type PostMode = "single" | "multiple";

type UploadPhase =
  | "idle"
  | "requesting_url"
  | "uploading_s3"
  | "completing"
  | "processing_video"
  | "creating_post"
  | "done"
  | "error";

const MAX_POSTS = 10;
const MAX_MEDIA_ITEMS = 10;

const createEmptyPostDraft = (index = 1): PostDraft => ({
  id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  mediaItems: [],
  activeMediaIndex: 0,
  caption: "",
  selectedCategories: [],
  location: "",
  locationData: null,
  locationError: "",
});

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const UploadFormContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { executeWithCheck } = useAccessControl();

  // Mode: "single" or "multiple" (batch)
  const initialMode = (searchParams.get("mode") as PostMode) || "single";
  const [mode, setMode] = useState<PostMode>(initialMode);

  // List of post drafts (1 in single mode, 1 to 10 in multiple mode)
  const [posts, setPosts] = useState<PostDraft[]>([createEmptyPostDraft(1)]);
  const [activePostIndex, setActivePostIndex] = useState<number>(0);

  // Global terms agreement
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  // Video trimming modal state (scoped to active post)
  const [trimMediaIndex, setTrimMediaIndex] = useState<number | null>(null);
  const [isTrimModalOpen, setIsTrimModalOpen] = useState<boolean>(false);

  // Upload progress state
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");

  // Modals
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTrialLimitModalOpen, setIsTrialLimitModalOpen] = useState(false);
  const [trialLimitMessage, setTrialLimitMessage] = useState<
    string | undefined
  >();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendFileInputRef = useRef<HTMLInputElement>(null);

  // Sync mode from searchParams if query param changes
  useEffect(() => {
    const queryMode = searchParams.get("mode") as PostMode;
    if (queryMode && (queryMode === "single" || queryMode === "multiple")) {
      setMode(queryMode);
      if (queryMode === "multiple" && posts.length === 1) {
        // Optionally start with 2 posts or keep 1 with Add Post button
      }
    }
  }, [searchParams]);

  // Handle initial image from query params (e.g. from personal storage "Make Post")
  useEffect(() => {
    const fileId = searchParams.get("fileId");
    const imageUrl = searchParams.get("imageUrl");

    if (fileId && imageUrl) {
      const decodedUrl = decodeURIComponent(imageUrl);
      setPosts((prev) => {
        const copy = [...prev];
        copy[0] = {
          ...copy[0],
          mediaItems: [
            {
              id: `storage-${fileId}`,
              file: null,
              fileId,
              previewUrl: decodedUrl,
              mediaType: "image",
              name: "Imported Image",
            },
          ],
          activeMediaIndex: 0,
        };
        return copy;
      });
      setActivePostIndex(0);
    }
  }, [searchParams]);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoriesApi({ limit: 100 }),
  });

  const categories =
    categoriesData?.data?.results || categoriesData?.data || [];

  // Active post draft reference
  const currentPost = posts[activePostIndex] || posts[0];
  const activeMediaItem =
    currentPost?.mediaItems[currentPost?.activeMediaIndex] ||
    currentPost?.mediaItems[0] ||
    null;

  // ── Post Draft Management (Add / Delete / Switch Post) ───────────────────────

  const handleAddPost = () => {
    if (posts.length >= MAX_POSTS) {
      setUploadError(`Maximum ${MAX_POSTS} posts allowed per batch request.`);
      return;
    }
    const newDraft = createEmptyPostDraft(posts.length + 1);
    setPosts((prev) => [...prev, newDraft]);
    setActivePostIndex(posts.length);
    setUploadError("");
  };

  const handleRemovePost = (indexToRemove: number) => {
    if (posts.length <= 1) return; // Keep at least one post draft
    setPosts((prev) => {
      const postToRemove = prev[indexToRemove];
      // Clean up object URLs for removed post
      postToRemove.mediaItems.forEach((m) => {
        if (m.previewUrl && !m.previewUrl.startsWith("http")) {
          URL.revokeObjectURL(m.previewUrl);
        }
      });
      return prev.filter((_, idx) => idx !== indexToRemove);
    });

    if (activePostIndex >= indexToRemove && activePostIndex > 0) {
      setActivePostIndex((prev) => prev - 1);
    }
    setUploadError("");
  };

  // ── Active Post Field Updaters ───────────────────────────────────────────────

  const updateActivePost = (updater: (p: PostDraft) => PostDraft) => {
    setPosts((prev) => {
      const copy = [...prev];
      if (copy[activePostIndex]) {
        copy[activePostIndex] = updater(copy[activePostIndex]);
      }
      return copy;
    });
  };

  const setLocationForActivePost = (
    address: string,
    data: PlaceSelectionDetails | null
  ) => {
    updateActivePost((p) => ({
      ...p,
      location: address,
      locationData: data,
      locationError: "",
    }));
  };

  const setCaptionForActivePost = (caption: string) => {
    updateActivePost((p) => ({ ...p, caption }));
  };

  const toggleCategoryForActivePost = (catId: string) => {
    updateActivePost((p) => ({
      ...p,
      selectedCategories: p.selectedCategories.includes(catId)
        ? p.selectedCategories.filter((id) => id !== catId)
        : [...p.selectedCategories, catId],
    }));
  };

  // ── Multi-Media Files Handler for Active Post ────────────────────────────────

  const processNewFilesForActivePost = async (files: File[]) => {
    if (files.length === 0) return;

    const remainingSlots = MAX_MEDIA_ITEMS - currentPost.mediaItems.length;
    if (remainingSlots <= 0) {
      setUploadError(
        `Maximum ${MAX_MEDIA_ITEMS} media items allowed per post.`
      );
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setUploadError(
        `Added first ${remainingSlots} item${
          remainingSlots > 1 ? "s" : ""
        }. Maximum ${MAX_MEDIA_ITEMS} items allowed per post.`
      );
    } else {
      setUploadError("");
    }

    const newDrafts: MediaItemDraft[] = [];

    for (const file of filesToProcess) {
      const validation = validateMediaFile(file);
      if (!validation.valid) {
        setUploadError(
          validation.error || `File ${file.name} is not supported.`
        );
        continue;
      }

      const mediaType = validation.type;
      const previewUrl = URL.createObjectURL(file);

      let duration: number | null = null;
      if (mediaType === "video") {
        try {
          duration = await new Promise<number>((resolve) => {
            const videoElement = document.createElement("video");
            videoElement.preload = "metadata";
            videoElement.onloadedmetadata = () => {
              window.URL.revokeObjectURL(videoElement.src);
              resolve(videoElement.duration);
            };
            videoElement.onerror = () => resolve(0);
            videoElement.src = URL.createObjectURL(file);
          });
        } catch {
          duration = null;
        }
      }

      newDrafts.push({
        id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        fileId: null,
        previewUrl,
        mediaType,
        videoDuration: duration,
        name: file.name,
      });
    }

    if (newDrafts.length > 0) {
      updateActivePost((p) => {
        const updatedMedia = [...p.mediaItems, ...newDrafts];
        return {
          ...p,
          mediaItems: updatedMedia,
          activeMediaIndex:
            p.mediaItems.length === 0 ? 0 : p.activeMediaIndex,
        };
      });
    }
  };

  const handleInitialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processNewFilesForActivePost(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleAppendUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processNewFilesForActivePost(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleImportImage = (image: FolderImageItem) => {
    if (currentPost.mediaItems.length >= MAX_MEDIA_ITEMS) {
      setUploadError(
        `Maximum ${MAX_MEDIA_ITEMS} media items allowed per post.`
      );
      return;
    }

    const newDraft: MediaItemDraft = {
      id: `storage-${image._id}-${Date.now()}`,
      file: null,
      fileId: image._id,
      previewUrl: image.location,
      mediaType: "image",
      name: "Imported Image",
    };

    updateActivePost((p) => ({
      ...p,
      mediaItems: [...p.mediaItems, newDraft],
    }));
    setUploadError("");
  };

  const handleRemoveMedia = (indexToRemove: number) => {
    updateActivePost((p) => {
      const itemToRemove = p.mediaItems[indexToRemove];
      if (
        itemToRemove?.previewUrl &&
        !itemToRemove.previewUrl.startsWith("http")
      ) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      const updated = p.mediaItems.filter((_, idx) => idx !== indexToRemove);
      const newActiveIdx =
        p.activeMediaIndex >= indexToRemove && p.activeMediaIndex > 0
          ? p.activeMediaIndex - 1
          : 0;
      return {
        ...p,
        mediaItems: updated,
        activeMediaIndex: newActiveIdx,
      };
    });
    setUploadError("");
  };

  const handleMoveMedia = (fromIndex: number, direction: "left" | "right") => {
    const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= currentPost.mediaItems.length) return;

    updateActivePost((p) => {
      const copy = [...p.mediaItems];
      const temp = copy[fromIndex];
      copy[fromIndex] = copy[toIndex];
      copy[toIndex] = temp;
      let newActive = p.activeMediaIndex;
      if (p.activeMediaIndex === fromIndex) newActive = toIndex;
      else if (p.activeMediaIndex === toIndex) newActive = fromIndex;
      return {
        ...p,
        mediaItems: copy,
        activeMediaIndex: newActive,
      };
    });
  };

  const handleOpenTrimmer = (mediaIndex: number) => {
    setTrimMediaIndex(mediaIndex);
    setIsTrimModalOpen(true);
  };

  const handleTrimComplete = (
    trimmedFile: File,
    trimmedDuration: number,
    previewUrl: string
  ) => {
    if (trimMediaIndex === null || !currentPost.mediaItems[trimMediaIndex])
      return;

    const normalizedDuration =
      trimmedDuration >= 9.5 && trimmedDuration < 10.4
        ? 10
        : Math.min(59, Math.round(trimmedDuration * 10) / 10);

    updateActivePost((p) => {
      const copy = [...p.mediaItems];
      copy[trimMediaIndex] = {
        ...copy[trimMediaIndex],
        file: trimmedFile,
        previewUrl,
        videoDuration: normalizedDuration,
      };
      return { ...p, mediaItems: copy };
    });

    setUploadError("");
    setIsTrimModalOpen(false);
    setTrimMediaIndex(null);
  };

  // ── Error Parsing (All-or-Nothing Section 2) ────────────────────────────────

  const parseBackendError = (err: any): string => {
    const data = err?.response?.data;
    if (Array.isArray(data?.error) && data.error.length > 0) {
      const detailMessages = data.error.map((e: any) => {
        const path = e.path || "";
        const msg = e.message || "Invalid item";

        // path format: posts.<postIndex>.<field>[.<itemIndex>]
        const postMatch = path.match(/^posts\.(\d+)(?:\.(.+))?/);
        if (postMatch) {
          const postIdx = parseInt(postMatch[1], 10);
          const postNum = postIdx + 1;
          const subField = postMatch[2] || "";

          // Auto-switch to offending post in multiple mode
          if (mode === "multiple" && postIdx < posts.length) {
            setActivePostIndex(postIdx);
          }

          if (subField.startsWith("media.")) {
            const mediaNum = parseInt(subField.split(".")[1], 10) + 1;
            return `Post #${postNum} Media item #${mediaNum}: ${msg}`;
          }
          if (subField === "categories") {
            return `Post #${postNum}: Invalid category selection`;
          }
          if (subField === "caption") {
            return `Post #${postNum} Caption: ${msg}`;
          }
          return `Post #${postNum}: ${msg}`;
        }
        return msg;
      });
      return detailMessages.join(" • ");
    }
    return (
      data?.message ||
      err?.file?.rejectionReason ||
      err?.message ||
      "Failed to process and create posts. Please try again."
    );
  };

  // ── Submit Posts (Single or Batch) ──────────────────────────────────────────

  const handleGenerate = async () => {
    // 1. Validate each post draft
    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      const postLabel = mode === "multiple" ? `Post #${i + 1}: ` : "";

      if (p.mediaItems.length === 0) {
        setUploadError(`${postLabel}Please select at least 1 image or video.`);
        setActivePostIndex(i);
        return;
      }

      if (p.mediaItems.length > MAX_MEDIA_ITEMS) {
        setUploadError(
          `${postLabel}Cannot exceed ${MAX_MEDIA_ITEMS} media items.`
        );
        setActivePostIndex(i);
        return;
      }

      if (!p.location.trim()) {
        setUploadError(`${postLabel}Location is required.`);
        updateActivePost((prev) => ({
          ...prev,
          locationError: "Location is required.",
        }));
        setActivePostIndex(i);
        return;
      }

      if (p.selectedCategories.length === 0) {
        setUploadError(
          `${postLabel}Please select at least one category.`
        );
        setActivePostIndex(i);
        return;
      }

      // Duration checks on videos
      for (let mIdx = 0; mIdx < p.mediaItems.length; mIdx++) {
        const item = p.mediaItems[mIdx];
        if (
          item.mediaType === "video" &&
          item.videoDuration !== null &&
          item.videoDuration !== undefined
        ) {
          if (item.videoDuration < 9.5 || item.videoDuration > 60.5) {
            setUploadError(
              `${postLabel}Video #${mIdx + 1} duration (${Math.round(
                item.videoDuration
              )}s) must be between 10 and 60 seconds.`
            );
            setActivePostIndex(i);
            handleOpenTrimmer(mIdx);
            return;
          }
        }
      }
    }

    if (!agreedToTerms) {
      setUploadError("Please agree to the Terms of Service license.");
      return;
    }

    executeWithCheck(async () => {
      try {
        setUploadError("");

        // 2. Collect all local files across all posts for batch S3 upload
        const filesToUpload: File[] = [];
        const fileUploadMapping: { postIdx: number; mediaIdx: number }[] = [];

        posts.forEach((p, pIdx) => {
          p.mediaItems.forEach((m, mIdx) => {
            if (m.file && !m.fileId) {
              fileUploadMapping.push({ postIdx: pIdx, mediaIdx: mIdx });
              filesToUpload.push(m.file);
            }
          });
        });

        const uploadedResults: FileObject[] = [];
        if (filesToUpload.length > 0) {
          setUploadPhase("requesting_url");
          setUploadProgress(10);
          setUploadMessage(
            `Authorizing ${filesToUpload.length} media file${
              filesToUpload.length > 1 ? "s" : ""
            }...`
          );

          const results = await uploadMixedMediaFiles(
            filesToUpload,
            (stage, pct, msg) => {
              if (stage === "processing") {
                setUploadPhase("processing_video");
              } else if (stage === "uploading_s3") {
                setUploadPhase("uploading_s3");
              } else if (stage === "completing") {
                setUploadPhase("completing");
              }
              setUploadProgress(pct);
              setUploadMessage(msg);
            }
          );
          uploadedResults.push(...results);
        }

        // Map uploaded file IDs back to posts
        const fileIdLookup: { [key: string]: string } = {};
        fileUploadMapping.forEach((mapping, uploadIdx) => {
          const key = `${mapping.postIdx}_${mapping.mediaIdx}`;
          const res = uploadedResults[uploadIdx];
          if (res?._id) {
            fileIdLookup[key] = res._id;
          }
        });

        // 3. Build POST /posts body with { posts: [ ... ] }
        setUploadPhase("creating_post");
        setUploadProgress(92);
        setUploadMessage(
          mode === "multiple"
            ? `Publishing ${posts.length} posts...`
            : "Publishing post..."
        );

        const payloadPosts = posts.map((p, pIdx) => {
          const mediaIds: string[] = [];
          p.mediaItems.forEach((m, mIdx) => {
            if (m.fileId) {
              mediaIds.push(m.fileId);
            } else {
              const uploadedId = fileIdLookup[`${pIdx}_${mIdx}`];
              if (uploadedId) mediaIds.push(uploadedId);
            }
          });

          return {
            caption: p.caption.trim() || undefined,
            categories: p.selectedCategories,
            media: mediaIds,
            country: p.locationData?.country || undefined,
            state: p.locationData?.state || undefined,
            latitude: p.locationData?.latitude?.toString() || undefined,
            longitude: p.locationData?.longitude?.toString() || undefined,
            isContentReleaseAccepted: agreedToTerms,
          };
        });

        const res = await createPostApi({ posts: payloadPosts });
        console.log("Post(s) created successfully:", res);

        setUploadPhase("done");
        setUploadProgress(100);
        setUploadMessage(
          mode === "multiple"
            ? `${posts.length} Posts published successfully!`
            : "Post published successfully!"
        );

        setTimeout(() => {
          router.push("/Profile?tab=posts");
        }, 1000);
      } catch (err: any) {
        setUploadPhase("error");
        if (isTrialLimitError(err)) {
          setTrialLimitMessage(getApiErrorMessage(err));
          setIsTrialLimitModalOpen(true);
          return;
        }

        const msg = parseBackendError(err);
        setUploadError(msg);
        console.error("Error creating post(s):", err);
      }
    });
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      posts.forEach((p) => {
        p.mediaItems.forEach((m) => {
          if (m.previewUrl && !m.previewUrl.startsWith("http")) {
            URL.revokeObjectURL(m.previewUrl);
          }
        });
      });
    };
  }, [posts]);

  const isSubmitting =
    uploadPhase !== "idle" &&
    uploadPhase !== "error" &&
    uploadPhase !== "done";

  return (
    <div className="min-h-screen pb-16">
      <TrialLimitModal
        isOpen={isTrialLimitModalOpen}
        onClose={() => {
          setIsTrialLimitModalOpen(false);
          setTrialLimitMessage(undefined);
          setUploadPhase("idle");
        }}
        description={trialLimitMessage}
      />
      <Header
        title={mode === "multiple" ? "Batch Create Posts" : "Create Post"}
        subtitle=""
      />

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-8 m-4 border border-gray-100">
        {/* Header with Back & Mode Toggle */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-start">
            <button
              onClick={() => router.back()}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0 mt-0.5"
              aria-label="Back"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 mb-0.5">
                {mode === "multiple"
                  ? "Create Multiple Posts (Batch)"
                  : "Create New Post"}
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                {mode === "multiple"
                  ? "Draft up to 10 separate posts at once. Each post can have multiple photos and videos."
                  : "Upload up to 10 photos or videos in a single post story. The 1st item serves as cover."}
              </p>
            </div>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-gray-100 p-1 rounded-full text-xs font-semibold shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMode("single");
                // If switching to single, keep only the active post
                if (posts.length > 1) {
                  setPosts([posts[activePostIndex] || posts[0]]);
                  setActivePostIndex(0);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                mode === "single"
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Images className="w-3.5 h-3.5" />
              <span>Single</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("multiple")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                mode === "multiple"
                  ? "bg-white text-purple-600 shadow-sm font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multiple ({posts.length})</span>
            </button>
          </div>
        </div>

        {/* Multiple Posts Tabs Strip (Shown when mode === "multiple") */}
        {mode === "multiple" && (
          <div className="mb-6 p-3 bg-purple-50/60 border border-purple-100 rounded-2xl">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-purple-900">
                Post Batch ({posts.length}/{MAX_POSTS})
              </span>
              <span className="text-[11px] text-purple-700">
                Click a post tab to edit its media & location
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-thin">
              {posts.map((p, idx) => {
                const isActive = idx === activePostIndex;
                const coverThumb = p.mediaItems[0]?.previewUrl;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActivePostIndex(idx)}
                    className={`relative shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all border ${
                      isActive
                        ? "bg-white border-purple-600 text-purple-900 shadow-md ring-2 ring-purple-200"
                        : "bg-white/70 border-gray-200 text-gray-700 hover:bg-white"
                    }`}
                  >
                    {/* Small thumbnail or post icon */}
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-gray-100 relative shrink-0 flex items-center justify-center border border-gray-200">
                      {coverThumb ? (
                        <Image
                          src={coverThumb}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-[11px] font-bold text-gray-500">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold leading-tight">
                        Post {idx + 1}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {p.mediaItems.length} media
                      </span>
                    </div>

                    {/* Delete post button (only if > 1 post) */}
                    {posts.length > 1 && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePost(idx);
                        }}
                        className="ml-1 p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"
                        title="Delete post draft"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add New Post Draft Button */}
              {posts.length < MAX_POSTS && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleAddPost}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border-2 border-dashed border-purple-300 bg-white hover:bg-purple-100/60 text-purple-700 text-xs font-bold transition shadow-sm"
                  title="Add another post to this batch"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Post</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Multi-Media Area for the Active Post */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-bold text-gray-800">
              {mode === "multiple"
                ? `Media for Post #${activePostIndex + 1}`
                : "Post Media"}
            </span>
            {currentPost.mediaItems.length > 0 && (
              <span className="text-xs text-gray-500">
                {currentPost.mediaItems.length}/{MAX_MEDIA_ITEMS} items
              </span>
            )}
          </div>

          {activeMediaItem && (
            <div className="mt-2 flex flex-col items-center">
              {/* Active Hero Preview */}
              <div className="w-full max-w-[460px] aspect-[4/3] relative rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-black group">
                {activeMediaItem.mediaType === "video" ? (
                  <video
                    key={activeMediaItem.previewUrl}
                    src={activeMediaItem.previewUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={activeMediaItem.previewUrl}
                    alt={activeMediaItem.name || "Preview"}
                    fill
                    className="object-contain"
                  />
                )}

                {/* Cover & Type Tags */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 flex-wrap">
                  {currentPost.activeMediaIndex === 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Cover
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-semibold shadow">
                    {activeMediaItem.mediaType === "video" ? (
                      <>
                        <Film className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          Video{" "}
                          {activeMediaItem.videoDuration
                            ? `(${formatDuration(
                                activeMediaItem.videoDuration
                              )})`
                            : ""}
                        </span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>Image</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Top-Right Action Controls */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                  {activeMediaItem.mediaType === "video" && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleOpenTrimmer(currentPost.activeMediaIndex)
                      }
                      className="px-3 py-1 bg-blue-600/90 hover:bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition hover:scale-105 active:scale-95 disabled:opacity-50"
                      title="Trim video"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Trim</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      handleRemoveMedia(currentPost.activeMediaIndex)
                    }
                    className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition disabled:opacity-50"
                    aria-label="Remove active media item"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>

                {/* Left/Right Prev/Next Overlay Arrows */}
                {currentPost.mediaItems.length > 1 && (
                  <>
                    {currentPost.activeMediaIndex > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateActivePost((p) => ({
                            ...p,
                            activeMediaIndex: p.activeMediaIndex - 1,
                          }))
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm shadow transition"
                        aria-label="Previous item"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    {currentPost.activeMediaIndex <
                      currentPost.mediaItems.length - 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateActivePost((p) => ({
                            ...p,
                            activeMediaIndex: p.activeMediaIndex + 1,
                          }))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm shadow transition"
                        aria-label="Next item"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Multi-Media Filmstrip / Thumbnail Selector */}
              <div className="w-full max-w-[460px] mt-4">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-bold text-gray-700">
                    Media Items ({currentPost.mediaItems.length}/
                    {MAX_MEDIA_ITEMS})
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Arrows to reorder • 1st is cover
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                  {currentPost.mediaItems.map((item, idx) => {
                    const isActive = idx === currentPost.activeMediaIndex;
                    return (
                      <div
                        key={item.id}
                        className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                          isActive
                            ? "border-blue-600 ring-2 ring-blue-300 scale-105 shadow-md"
                            : "border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100"
                        }`}
                        onClick={() =>
                          updateActivePost((p) => ({
                            ...p,
                            activeMediaIndex: idx,
                          }))
                        }
                      >
                        {item.mediaType === "video" ? (
                          <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white relative">
                            <video
                              src={item.previewUrl}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Film className="w-5 h-5 text-white/90" />
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={item.previewUrl}
                            alt={`Thumb ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        )}

                        {/* Cover Badge on thumb */}
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-white rounded-full p-0.5 shadow">
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}

                        {/* Reorder and Delete Mini Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 px-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={idx === 0 || isSubmitting}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveMedia(idx, "left");
                            }}
                            className="text-white hover:text-blue-300 disabled:opacity-20"
                            title="Move left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMedia(idx);
                            }}
                            className="text-red-400 hover:text-red-300"
                            title="Remove item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={
                              idx === currentPost.mediaItems.length - 1 ||
                              isSubmitting
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveMedia(idx, "right");
                            }}
                            className="text-white hover:text-blue-300 disabled:opacity-20"
                            title="Move right"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add More Media Button */}
                  {currentPost.mediaItems.length < MAX_MEDIA_ITEMS && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => appendFileInputRef.current?.click()}
                      className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/60 text-blue-600 flex flex-col items-center justify-center gap-1 transition-all"
                      title="Add more photos or videos"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px] font-bold">Add</span>
                    </button>
                  )}
                </div>

                <input
                  ref={appendFileInputRef}
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.webp,.heic,.mp4,.mov,image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime"
                  className="hidden"
                  onChange={handleAppendUpload}
                />
              </div>

              {/* Storage Import Option */}
              {currentPost.mediaItems.length < MAX_MEDIA_ITEMS && (
                <div className="w-full max-w-[460px] mt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsImportModalOpen(true)}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 underline underline-offset-2"
                  >
                    + Import image from Personal Storage
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State: Initial Upload Dropzone */}
          {currentPost.mediaItems.length === 0 && (
            <div className="space-y-4">
              <label
                htmlFor="media-upload-initial"
                className="relative block w-full border-2 border-dashed border-blue-300 bg-blue-50/60 rounded-2xl p-10 text-center cursor-pointer group hover:bg-blue-100/60 transition-colors"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div className="text-base font-bold text-blue-600 mb-1">
                    Upload Photos or Videos (Up to 10)
                  </div>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Select 1 to 10 items — any mix of photos and videos.
                    <br />
                    Images: PNG, JPG, WEBP, HEIC (Max 15MB)
                    <br />
                    Videos: MP4, MOV (10–60s, Max 200MB, trimmer included)
                  </p>
                </div>

                <input
                  id="media-upload-initial"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.webp,.heic,.mp4,.mov,image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime"
                  className="hidden"
                  onChange={handleInitialUpload}
                />
              </label>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold tracking-wider">
                  OR
                </span>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="w-full py-3.5 bg-white border-2 border-blue-100 text-blue-600 font-semibold rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                <div className="relative w-5 h-5 shrink-0">
                  <Image
                    src="/images/folder.png"
                    fill
                    alt="folder icon"
                    className="object-contain"
                  />
                </div>
                Import from Personal Storage
              </button>
            </div>
          )}

          {uploadError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 flex items-center justify-between gap-2 flex-wrap">
                <span>{uploadError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Location Input for Active Post */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="text-sm font-bold text-gray-700">
              Location{" "}
              {mode === "multiple" && (
                <span className="text-xs font-normal text-gray-500">
                  (for Post #{activePostIndex + 1})
                </span>
              )}
            </label>
          </div>
          <LocationAutocomplete
            key={`loc-${currentPost.id}`}
            placeholder="Search location..."
            value={currentPost.location}
            onChange={(e) => setLocationForActivePost(e.target.value, null)}
            onLocationSelect={(data) =>
              setLocationForActivePost(data.address, data)
            }
          />
          {currentPost.locationError && (
            <p className="mt-1.5 text-xs font-bold text-red-500">
              {currentPost.locationError}
            </p>
          )}
        </div>

        {/* Caption Input for Active Post */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="text-sm font-bold text-gray-700">
              Caption{" "}
              {mode === "multiple" && (
                <span className="text-xs font-normal text-gray-500">
                  (for Post #{activePostIndex + 1})
                </span>
              )}
            </label>
          </div>
          <textarea
            placeholder="Share a story about this place..."
            value={currentPost.caption}
            maxLength={150}
            rows={3}
            onChange={(e) => setCaptionForActivePost(e.target.value)}
            className="w-full px-4 py-3 bg-blue-50/50 border border-transparent focus:border-blue-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-all"
          />
          <p
            className={`text-xs flex justify-end mt-1 ${
              currentPost.caption.length >= 150
                ? "text-red-500 font-bold"
                : "text-gray-400"
            }`}
          >
            {currentPost.caption.length}/150
          </p>
        </div>

        {/* Categories Selection for Active Post */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            Select Categories{" "}
            {mode === "multiple" && (
              <span className="text-xs font-normal text-gray-500">
                (for Post #{activePostIndex + 1})
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <CategoryChipSkeleton key={i} />
              ))
            ) : (
              categories.map((cat: any) => {
                const catId = cat.id || cat._id;
                const isSelected =
                  currentPost.selectedCategories.includes(catId);
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => toggleCategoryForActivePost(catId)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      isSelected
                        ? "gradient-bg text-white border-none shadow-md scale-105"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Terms and License Checkbox (Applies to all created posts) */}
        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
            />
            <span className="ml-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
              By uploading media, you grant a license to Frame The World LLC, as
              set forth in the{" "}
              <Link
                href="https://www.frametheworld.org/terms-of-service"
                target="_blank"
                className="underline text-blue-600 hover:text-blue-800 transition-colors font-semibold"
              >
                Terms of Service
              </Link>
              .
            </span>
          </label>
        </div>

        <ContentReleaseModal
          isOpen={isReleaseModalOpen}
          onClose={() => setIsReleaseModalOpen(false)}
        />

        <ImportFolderModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportImage}
        />

        {/* Video Trimmer Modal */}
        <VideoTrimModal
          isOpen={isTrimModalOpen}
          onClose={() => {
            setIsTrimModalOpen(false);
            setTrimMediaIndex(null);
          }}
          videoFile={
            trimMediaIndex !== null && currentPost.mediaItems[trimMediaIndex]
              ? currentPost.mediaItems[trimMediaIndex].file
              : null
          }
          onTrimComplete={handleTrimComplete}
        />

        {/* Upload Progress Banner */}
        {isSubmitting && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col gap-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-blue-700">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                {uploadMessage || "Processing..."}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-blue-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleGenerate}
          disabled={
            !agreedToTerms ||
            posts.some((p) => p.mediaItems.length === 0) ||
            isSubmitting
          }
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                {uploadPhase === "processing_video"
                  ? "Verifying Videos..."
                  : uploadPhase === "uploading_s3"
                  ? "Uploading Media..."
                  : uploadPhase === "completing"
                  ? "Finalizing..."
                  : "Publishing..."}
              </span>
            </>
          ) : mode === "multiple" ? (
            `Publish All (${posts.length} Posts)`
          ) : (
            `Post ${
              currentPost.mediaItems.length > 1
                ? `(${currentPost.mediaItems.length} items)`
                : ""
            }`
          )}
        </button>
      </div>
    </div>
  );
};

export default function UploadForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      }
    >
      <UploadFormContent />
    </Suspense>
  );
}
