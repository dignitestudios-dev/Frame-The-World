"use client";

import Image from "next/image";
import Header from "@/components/global/header";
import React, { useEffect, useState, Suspense, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPostApi, getCategoriesApi } from "@/services/postApi";
import {
  detectMediaType,
  normalizeMimeType,
  requestUploadUrlsApi,
  uploadBytesToS3,
  completeUploadsApi,
  pollVideoFileUntilReady,
  validateMediaFile,
  MEDIA_LIMITS,
  MediaFileType,
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
  Sparkles,
} from "lucide-react";
import LocationAutocomplete, { PlaceSelectionDetails } from "@/components/global/LocationAutocomplete";

interface UploadFormProps {
  onGenerate?: (data: any) => void;
}

interface FormDataState {
  file: File | null;
  mediaType: MediaFileType | null;
  caption: string;
  agreedToTerms: boolean;
  categories: string[];
  fileId: string | null;
}

type UploadPhase =
  | "idle"
  | "requesting_url"
  | "uploading_s3"
  | "finalizing"
  | "processing_video"
  | "creating_post"
  | "done"
  | "error";

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const UploadFormContent: React.FC<UploadFormProps> = () => {
  const [formData, setFormData] = useState<FormDataState>({
    file: null,
    mediaType: null,
    caption: "",
    agreedToTerms: false,
    categories: [],
    fileId: null,
  });

  const [location, setLocation] = useState<string>("");
  const [locationData, setLocationData] = useState<PlaceSelectionDetails | null>(null);
  const [locationError, setLocationError] = useState<string>("");

  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [rawVideoFile, setRawVideoFile] = useState<File | null>(null);
  const [isTrimModalOpen, setIsTrimModalOpen] = useState<boolean>(false);

  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadMessage, setUploadMessage] = useState<string>("");

  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [isTrialLimitModalOpen, setIsTrialLimitModalOpen] = useState(false);
  const [trialLimitMessage, setTrialLimitMessage] = useState<string | undefined>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { executeWithCheck } = useAccessControl();

  // Handle initial image from query params (e.g. from personal storage "Make Post")
  useEffect(() => {
    const fileId = searchParams.get("fileId");
    const imageUrl = searchParams.get("imageUrl");

    if (fileId && imageUrl) {
      setFormData((prev) => ({
        ...prev,
        fileId,
        file: null,
        mediaType: "image",
      }));
      setMediaPreview(decodeURIComponent(imageUrl));
    }
  }, [searchParams]);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoriesApi({ limit: 100 }),
  });

  const categories = categoriesData?.data?.results || categoriesData?.data || [];

  const toggleCategory = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((catId) => catId !== id)
        : [...prev.categories, id],
    }));
  };

  // Handle media file upload selection
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateMediaFile(file);

      if (!validation.valid) {
        setUploadError(validation.error || "Invalid file format or size.");
        e.target.value = "";
        return;
      }

      setUploadError("");
      const mediaType = validation.type;
      const previewUrl = URL.createObjectURL(file);

      if (mediaType === "video") {
        setRawVideoFile(file);
        // Measure duration client-side for immediate user feedback
        const videoElement = document.createElement("video");
        videoElement.preload = "metadata";
        videoElement.onloadedmetadata = () => {
          window.URL.revokeObjectURL(videoElement.src);
          const duration = videoElement.duration;
          setVideoDuration(duration);

          if (duration > 60.5) {
            setUploadError(
              `Video duration (${Math.round(duration)}s) exceeds 60 seconds. Please trim your video to 59 seconds or less.`
            );
            // Automatically open trim modal for user convenience
            setIsTrimModalOpen(true);
          } else if (duration < 9.5) {
            setUploadError(
              `Video duration (${Math.round(duration)}s) is shorter than 10 seconds. Videos must be at least 10 seconds.`
            );
          } else {
            setUploadError("");
          }
        };
        videoElement.src = URL.createObjectURL(file);
      } else {
        setRawVideoFile(null);
        setVideoDuration(null);
      }

      setFormData((prev) => ({
        ...prev,
        file,
        mediaType,
        fileId: null,
      }));
      setMediaPreview(previewUrl);
    }
  };

  const handleImportImage = (image: FolderImageItem) => {
    setFormData((prev) => ({
      ...prev,
      file: null,
      mediaType: "image",
      fileId: image._id,
    }));
    setMediaPreview(image.location);
    setRawVideoFile(null);
    setVideoDuration(null);
    setUploadError("");
  };

  const handleRemoveMedia = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
      mediaType: null,
      fileId: null,
    }));
    setMediaPreview(null);
    setRawVideoFile(null);
    setVideoDuration(null);
    setLocation("");
    setLocationData(null);
    setLocationError("");
    setUploadError("");
    setUploadPhase("idle");
    setUploadProgress(0);
    setUploadMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (searchParams.get("fileId") || searchParams.get("imageUrl")) {
      router.replace("/Createdpost");
    }
  };

  // Callback when video trimming completes
  const handleTrimComplete = (trimmedFile: File, trimmedDuration: number, previewUrl: string) => {
    // Normalize duration: if close to 10s (9.5-10.4), set to 10s. Cap max to 59s.
    const normalizedDuration =
      trimmedDuration >= 9.5 && trimmedDuration < 10.4
        ? 10
        : Math.min(59, Math.round(trimmedDuration * 10) / 10);

    setFormData((prev) => ({
      ...prev,
      file: trimmedFile,
      mediaType: "video",
    }));
    setMediaPreview(previewUrl);
    setVideoDuration(normalizedDuration);
    setUploadError("");
  };

  // Perform the multi-step upload flow and post creation
  const handleGenerate = async () => {
    if (!formData.file && !formData.fileId) return;

    if (!location.trim()) {
      setLocationError("Location is required.");
      return;
    }

    if (
      formData.mediaType === "video" &&
      videoDuration !== null &&
      (videoDuration < 9.5 || videoDuration > 60.5)
    ) {
      setUploadError(
        `Video duration is ${Math.round(videoDuration)}s. Videos must be between 10 and 59 seconds.`
      );
      setIsTrimModalOpen(true);
      return;
    }

    executeWithCheck(async () => {
      try {
        setUploadError("");
        let finalFileId = formData.fileId;

        if (formData.file) {
          const file = formData.file;
          const mediaType = formData.mediaType || detectMediaType(file);
          const mimeType = normalizeMimeType(file);

          // Step 1: Request pre-signed upload URL
          setUploadPhase("requesting_url");
          setUploadMessage("Authorizing upload...");
          setUploadProgress(10);

          const urlResponse = await requestUploadUrlsApi([
            {
              fileName: file.name,
              mimeType,
              type: mediaType,
            },
          ]);

          const uploadItem = urlResponse.data?.files?.[0];
          if (!uploadItem || !uploadItem.uploadUrl || !uploadItem.fileId) {
            throw new Error("Unable to obtain secure upload authorization.");
          }

          finalFileId = uploadItem.fileId;

          // Step 2: Direct PUT to S3 (with automatic proxy fallback if browser CORS blocks)
          setUploadPhase("uploading_s3");
          setUploadMessage("Uploading file to secure storage...");

          await uploadBytesToS3(uploadItem.uploadUrl, file, mimeType, (pct) => {
            setUploadProgress(10 + Math.round(pct * 0.5)); // 10% to 60%
            setUploadMessage(`Uploading: ${pct}%`);
          });

          // Step 3: Tell backend the upload is complete
          setUploadPhase("finalizing");
          setUploadProgress(65);
          setUploadMessage("Finalizing upload with server...");

          const completeRes = await completeUploadsApi([finalFileId]);
          const completedFile = completeRes.data?.files?.[0];

          if (!completedFile) {
            throw new Error("Failed to finalize upload on server.");
          }

          // Step 4 (Video only): Poll until processing / human-detection finishes
          if (mediaType === "video") {
            setUploadPhase("processing_video");
            setUploadProgress(75);
            setUploadMessage("Analyzing video (checking 10–60s duration & scanning for humans)...");

            await pollVideoFileUntilReady(finalFileId, () => {
              setUploadMessage("Checking video criteria and scanning for people...");
            });
          }
        }

        if (!finalFileId) {
          throw new Error("No media file ID available to attach.");
        }

        // Step 5: Create Post with media: fileId
        setUploadPhase("creating_post");
        setUploadProgress(90);
        setUploadMessage("Creating post...");

        const postPayload = {
          media: finalFileId,
          caption: formData.caption.trim() || undefined,
          categories: formData.categories,
          country: locationData?.country || undefined,
          state: locationData?.state || undefined,
          latitude: locationData?.latitude?.toString() || undefined,
          longitude: locationData?.longitude?.toString() || undefined,
          isContentReleaseAccepted: formData.agreedToTerms,
        };

        const postRes = await createPostApi(postPayload);
        console.log("Post created successfully:", postRes);

        setUploadPhase("done");
        setUploadProgress(100);
        setUploadMessage("Post published successfully!");

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

        const msg =
          err?.file?.rejectionReason ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to process and create post. Please try again.";
        setUploadError(msg);
        console.error("Error creating post:", err);
      }
    });
  };

  useEffect(() => {
    return () => {
      if (mediaPreview && !mediaPreview.startsWith("http")) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

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
      <Header title={"Create Post"} subtitle={""} />

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-8 m-4 border border-gray-100">
        {/* Header */}
        <div className="flex items-start mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
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
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Create New Post
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Upload original photos or videos. Our AI verifies content for originality, ensuring no humans or AI edits. Video clips must be between 10 and 60 seconds without humans.
            </p>
          </div>
        </div>

        {/* Media Upload Area */}
        <div className="mb-6">
          {mediaPreview && (
            <div className="mt-2 flex flex-col items-center">
              <div className="w-full max-w-[440px] aspect-[4/3] relative rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-black group">
                {formData.mediaType === "video" ? (
                  <video
                    src={mediaPreview}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={mediaPreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                )}

                {/* Media Type & Duration Tag */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-semibold shadow">
                  {formData.mediaType === "video" ? (
                    <>
                      <Film className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        Video {videoDuration ? `(${formatDuration(videoDuration)})` : ""}
                      </span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>Image</span>
                    </>
                  )}
                </div>

                {/* Action Controls in Top-Right */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                  {/* Trim Video Button (for any uploaded video) */}
                  {formData.mediaType === "video" && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsTrimModalOpen(true)}
                      className="px-3 py-1 bg-blue-600/90 hover:bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition hover:scale-105 active:scale-95 disabled:opacity-50"
                      title="Trim video"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Trim</span>
                    </button>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleRemoveMedia}
                    className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition disabled:opacity-50"
                    aria-label="Remove media"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Video Trim Helper Prompt */}
              {formData.mediaType === "video" && (
                <div className="w-full max-w-[440px] mt-2.5 flex items-center justify-between px-3 py-2 bg-blue-50/80 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <Scissors className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Want to customize or cut your clip?</span>
                  </div>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsTrimModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2"
                  >
                    Open Trimmer
                  </button>
                </div>
              )}
            </div>
          )}

          {!mediaPreview && (
            <div className="space-y-4">
              <label
                htmlFor="media-upload"
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
                    Upload Photo or Video
                  </div>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Image: PNG, JPG, WEBP, HEIC (Max 15MB)
                    <br />
                    Video: MP4, MOV (10–60s, Max 200MB, with in-app trimmer)
                  </p>
                </div>

                <input
                  id="media-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.heic,.mp4,.mov,image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime"
                  className="hidden"
                  onChange={handleMediaUpload}
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
                {formData.mediaType === "video" && rawVideoFile && (
                  <button
                    type="button"
                    onClick={() => setIsTrimModalOpen(true)}
                    className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[11px] font-bold hover:bg-red-700 transition flex items-center gap-1"
                  >
                    <Scissors className="w-3 h-3" />
                    Trim Video Now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Location Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="text-sm font-bold text-gray-700">Location</label>
          </div>
          <LocationAutocomplete
            placeholder="Search location..."
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

        {/* Caption Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="text-sm font-bold text-gray-700">Caption</label>
          </div>
          <textarea
            placeholder="Share a story about this place..."
            value={formData.caption}
            maxLength={150}
            rows={3}
            onChange={(e) =>
              setFormData({ ...formData, caption: e.target.value })
            }
            className="w-full px-4 py-3 bg-blue-50/50 border border-transparent focus:border-blue-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-all"
          />
          <p
            className={`text-xs flex justify-end mt-1 ${
              formData.caption.length >= 150 ? "text-red-500 font-bold" : "text-gray-400"
            }`}
          >
            {formData.caption.length}/150
          </p>
        </div>

        {/* Categories Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            Select Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <CategoryChipSkeleton key={i} />
              ))
            ) : (
              categories.map((cat: any) => {
                const catId = cat.id || cat._id;
                const isSelected = formData.categories.includes(catId);
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => toggleCategory(catId)}
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

        {/* License & Terms Checkbox */}
        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreedToTerms}
              onChange={(e) =>
                setFormData({ ...formData, agreedToTerms: e.target.checked })
              }
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
            />
            <span className="ml-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
              By uploading media, you grant a license to Frame The World LLC, as set forth in the{" "}
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
          onClose={() => setIsTrimModalOpen(false)}
          videoFile={rawVideoFile || formData.file}
          onTrimComplete={handleTrimComplete}
        />

        {/* In-flight Progress Banner */}
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

        {/* Post Button */}
        <button
          onClick={handleGenerate}
          disabled={
            (!formData.file && !formData.fileId) ||
            !formData.agreedToTerms ||
            formData.categories.length === 0 ||
            isSubmitting
          }
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                {uploadPhase === "processing_video"
                  ? "Verifying Video..."
                  : uploadPhase === "uploading_s3"
                  ? "Uploading..."
                  : "Posting..."}
              </span>
            </>
          ) : (
            "Post"
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
