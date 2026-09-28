"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategoriesApi, updatePostApi } from "@/services/postApi";

const MAX_POST_IMAGE_FILE_SIZE_BYTES = 15 * 1024 * 1024;
import Image from "next/image";
import LocationAutocomplete from "@/components/global/LocationAutocomplete";
import ContentReleaseModal from "@/components/global/ContentReleaseModal";
import DiscardUploadModal from "../createpost/DiscardUploadModal";

import VideoTrimModal from "../createpost/VideoTrimModal";
import { validateMediaFile, MEDIA_LIMITS } from "@/services/fileApi";

interface Post {
  id?: string;
  _id?: string;
  media?: { location: string; type?: string; thumbnail?: string } | string;
  caption?: string;
  categories?: Array<{ id?: string; _id?: string; name: string }>;
  location?: string;
  updatedAt?: string;
  status?: string;
}

interface EditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [imageError, setImageError] = useState<string>("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isTrimModalOpen, setIsTrimModalOpen] = useState<boolean>(false);
  const [locationError, setLocationError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  useEffect(() => {
    if (post) {
      setCaption(post.caption || "");
      setLocation(post.location || "");
      const catIds = (post.categories || [])
        .map((c) => c.id || c._id || "")
        .filter(Boolean);
      setSelectedCategories(catIds);
      setNewFile(null);
      setMediaPreview(null);
      setVideoDuration(null);
      setLocationError("");
      setAgreedToTerms(false);
    }
  }, [post]);

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoriesApi({ limit: 100 }),
    enabled: isOpen,
  });
  const categories =
    categoriesData?.data?.results || categoriesData?.data || [];

  const toggleCategory = (id: string) => {
    // Categories are read-only after posting
    console.warn("Categories cannot be edited");
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateMediaFile(file);

      if (!validation.valid) {
        setImageError(validation.error || "Invalid file format or size.");
        e.target.value = "";
        setNewFile(null);
        return;
      }

      setImageError("");
      setNewFile(file);
      setMediaType(validation.type);
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);

      if (validation.type === "video") {
        const vid = document.createElement("video");
        vid.preload = "metadata";
        vid.onloadedmetadata = () => {
          window.URL.revokeObjectURL(vid.src);
          const dur = vid.duration;
          setVideoDuration(dur);
          if (dur > MEDIA_LIMITS.MAX_VIDEO_DURATION_SECONDS) {
            setImageError(`Video duration (${Math.round(dur)}s) exceeds 60s limit. Please trim before submitting.`);
            setIsTrimModalOpen(true);
          } else if (dur < MEDIA_LIMITS.MIN_VIDEO_DURATION_SECONDS) {
            setImageError(`Video duration (${Math.round(dur)}s) is shorter than 10s minimum.`);
          }
        };
        vid.src = previewUrl;
      }
    }
  };

  const handleTrimComplete = (trimmedFile: File, trimmedDuration: number, previewUrl: string) => {
    setNewFile(trimmedFile);
    setMediaPreview(previewUrl);
    setVideoDuration(trimmedDuration);
    setImageError("");
  };

  const handleRemoveCaption = () => {
    setCaption("");
  };

  const postId = post?.id || post?._id || "";
  const existingMediaLocation =
    typeof post?.media === "string" ? post.media : (post?.media as any)?.location || null;
  const isExistingVideo =
    typeof post?.media === "object" && (post.media as any)?.type === "video";
  const currentPreview = mediaPreview || existingMediaLocation;

  const [uploadStatusText, setUploadStatusText] = useState<string>("");

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async () => {
      let mediaFileId: string | undefined = undefined;

      if (newFile) {
        setUploadStatusText("Uploading media...");
        const { uploadMediaFile } = await import("@/services/fileApi");
        const uploadedFile = await uploadMediaFile(newFile, (stage, _pct, msg) => {
          if (msg) setUploadStatusText(msg);
        });
        mediaFileId = uploadedFile._id;
      }

      setUploadStatusText("Updating post...");
      const payload: any = {};
      if (!isReuploadOnly) {
        payload.status = "completed";
        payload.country = locationData?.country || undefined;
        payload.state = locationData?.state || undefined;
        payload.latitude = locationData?.latitude?.toString() || undefined;
        payload.longitude = locationData?.longitude?.toString() || undefined;
        payload.isContentReleaseAccepted = true;
      }
      if (mediaFileId) {
        payload.media = mediaFileId;
      }

      return updatePostApi(postId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownPosts"] });
      onSuccess();
      onClose();
    },
  });

  const isReuploadOnly = post?.status === "rejected" || post?.status === "needs_human_removal";

  const handleSubmit = () => {
    if (!isReuploadOnly && !location.trim()) {
      setLocationError("Location is required.");
      return;
    }
    mutate();
  };

  if (!isOpen || !post) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 sm:p-6"
        onClick={() => { setIsDiscardModalOpen(true) }}
      >
        <div
          className={`w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 ${isReuploadOnly ? "max-w-2xl" : "max-w-lg"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 sm:px-8 py-5 flex items-center justify-between border-b border-gray-100">
            <h2 className={`font-bold text-gray-900 ${isReuploadOnly ? "text-xl sm:text-2xl" : "text-lg"}`}>
              {isReuploadOnly ? "Update Rejected Post" : "Edit Post"}
            </h2>
            <button
              onClick={() => { setIsDiscardModalOpen(true) }}
              className="p-2 rounded-full hover:bg-white/70 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className={`flex flex-col gap-5 overflow-y-auto ${isReuploadOnly ? "max-h-[85vh] p-6 sm:p-8" : "max-h-[80vh] p-6"}`}>
            {/* Media Preview */}
            <div
              onClick={() => isReuploadOnly && fileInputRef.current?.click()}
              className={`${!isReuploadOnly
                  ? "cursor-not-allowed border-transparent"
                  : "cursor-pointer border-dashed border-blue-200 hover:border-blue-400"
                } relative w-full rounded-2xl bg-black group border-2 transition-all ${isReuploadOnly ? "min-h-[320px] overflow-hidden sm:min-h-[340px]" : "h-64 overflow-hidden"
                }`}
            >
              {currentPreview ? (
                <>
                  {mediaType === "video" || (!mediaPreview && isExistingVideo) ? (
                    <video
                      src={currentPreview}
                      controls
                      playsInline
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <Image
                      src={currentPreview}
                      alt="Post"
                      fill
                      className={`rounded-xl object-contain transition-transform duration-500 ${isReuploadOnly
                          ? "group-hover:scale-[1.02]"
                          : "group-hover:scale-105"
                        }`}
                    />
                  )}
                  {isReuploadOnly && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 p-2 rounded-full shadow-lg">
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={`flex flex-col items-center justify-center gap-2 text-gray-400 ${isReuploadOnly ? "min-h-[280px] sm:min-h-[320px]" : "h-full"}`}>
                  <ImageIcon className={isReuploadOnly ? "w-12 h-12" : "w-10 h-10"} />
                  <span className={isReuploadOnly ? "text-base font-medium" : "text-sm"}>
                    Click to upload photo or video
                  </span>
                </div>
              )}
            </div>

            {/* Video Trimmer Button for re-uploaded video */}
            {isReuploadOnly && newFile && mediaType === "video" && (
              <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                <span className="text-xs text-blue-800 font-semibold">
                  Video Duration: {videoDuration ? `${Math.round(videoDuration)}s` : "Selected"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsTrimModalOpen(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                >
                  Trim Video
                </button>
              </div>
            )}

            {/* Keeping ref for compatibility */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.heic,.mp4,.mov,image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime"
              onChange={handleMediaChange}
              className="hidden"
              disabled={!isReuploadOnly}
            />
            {imageError && isReuploadOnly && (
              <p className="mt-2 text-xs font-bold text-red-500">
                {imageError}
              </p>
            )}
            {!isReuploadOnly && (
              <>
                {/* Location (Editable) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <LocationAutocomplete
                    placeholder="Enter location..."
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (locationError) setLocationError("");
                    }}
                    onLocationSelect={(data) => {
                      setLocation(data.address);
                      setLocationData(data);
                      if (locationError) setLocationError("");
                    }}
                  />
                  {locationError && (
                    <p className="mt-1.5 text-xs font-bold text-red-500">
                      {locationError}
                    </p>
                  )}
                </div>

                {/* Caption (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    disabled
                    rows={3}
                    placeholder="No caption..."
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-500 placeholder-gray-400 focus:outline-none resize-none cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Caption cannot be edited after posting
                  </p>
                </div>

                {/* Categories (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoriesLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-8 w-20 bg-gray-100 animate-pulse rounded-full"
                        />
                      ))
                    ) : selectedCategories.length > 0 ? (
                      categories.map((cat: any) => {
                        const catId = cat.id || cat._id;
                        const isSelected = selectedCategories.includes(catId);
                        if (!isSelected) return null;
                        return (
                          <span
                            key={catId}
                            className="px-4 py-1.5 rounded-full text-xs font-bold gradient-bg text-white border-none shadow-md"
                          >
                            {cat.name}
                          </span>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">No categories selected</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Categories cannot be edited after posting
                  </p>
                </div>
              </>
            )}

            {/* Error */}
            {isError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                <span className="font-medium">Error:</span>{" "}
                {(error as any)?.response?.data?.message ||
                  "Failed to update post. Please try again."}
              </div>
            )}

            <ContentReleaseModal
              isOpen={isReleaseModalOpen}
              onClose={() => setIsReleaseModalOpen(false)}
            />

            <VideoTrimModal
              isOpen={isTrimModalOpen}
              onClose={() => setIsTrimModalOpen(false)}
              videoFile={newFile}
              onTrimComplete={handleTrimComplete}
            />

            {isReuploadOnly && (
              <p className="text-center text-sm text-gray-500 sm:text-base">
                Upload a new photo or video (10–60s) without humans or AI edits, then submit for verification again.
              </p>
            )}

            {/* Actions */}
            <div className={`flex gap-3 ${isReuploadOnly ? "pt-2" : "pt-1"}`}>
              <button
                onClick={handleSubmit}
                disabled={isPending || (isReuploadOnly && !newFile)}
                className={`flex-1 w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold rounded-full hover:from-blue-500 hover:to-purple-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isReuploadOnly ? "py-3.5 text-base sm:text-lg" : "py-3"
                  }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadStatusText || "Posting..."}
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <DiscardUploadModal
        isOpen={isDiscardModalOpen}
        onDiscard={() => {
          setIsDiscardModalOpen(false);
          onClose();
        }}
        onCancel={() => setIsDiscardModalOpen(false)}
      />
    </>

  );
};

export default EditPostModal;
