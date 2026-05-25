"use client";

import Header from "@/components/global/header";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  deleteFolderImageApi,
  deleteFolderApi,
  getFolderImagesApi,
  renameFolderApi,
  uploadImageToFolderApi,
} from "@/services/frameApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/components/ui/toast";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Upload,
  Loader2,
  X,
  EllipsisVertical,
  Trash2,
  Download,
} from "lucide-react";
import { useAccessControl } from "@/providers/AccessControlProvider";

const INITIAL_PAGE = 1;
const PAGE_LIMIT = 30;
const MAX_UPLOAD_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB
const FALLBACK_IMAGE_URL =
  "https://t4.ftcdn.net/jpg/07/91/22/59/360_F_791225927_caRPPH99D6D1iFonkCRmCGzkJPf36QDw.jpg";

function isImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(url);
}

export default function PersonalStorageFolderImagesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { executeWithCheck } = useAccessControl();
  const params = useParams<{ folderId: string }>();
  const searchParams = useSearchParams();
  const folderId = params?.folderId;
  const initialFolderName = searchParams.get("name") || "Folder Images";
  const [folderName, setFolderName] = useState(initialFolderName);
  const [selectedImage, setSelectedImage] = useState<{
    _id: string;
    url: string;
  } | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    alt: string;
    downloadName?: string;
  } | null>(null);
  const [isDownloadingPreview, setIsDownloadingPreview] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteImageModalOpen, setIsDeleteImageModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameFolderName, setRenameFolderName] = useState(initialFolderName);
  const [renameError, setRenameError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{ file: File; url: string }[]>(
    [],
  );
  const [fileError, setFileError] = useState("");

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedForDownload, setSelectedForDownload] = useState<any[]>([]);
  const [isDownloadingMultiple, setIsDownloadingMultiple] = useState(false);

  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["folder-images", folderId, INITIAL_PAGE, PAGE_LIMIT],
    queryFn: () =>
      getFolderImagesApi(folderId, { page: INITIAL_PAGE, limit: PAGE_LIMIT }),
    enabled: Boolean(folderId),
  });

  const folderImages = (data?.data || []).filter((image) =>
    isImageUrl(image?.location),
  );

  const uploadImageMutation = useMutation({
    mutationFn: async () => {
      if (!folderId || selectedFiles.length === 0) {
        throw new Error("Please select at least one image to upload.");
      }
      return uploadImageToFolderApi(folderId, selectedFiles);
    },
    onSuccess: () => {
      setToast({
        open: true,
        message: "Images uploaded successfully",
        type: "success",
      });
      setIsUploadModalOpen(false);
      setSelectedFiles([]);
      setFileError("");
      queryClient.invalidateQueries({
        queryKey: ["folder-images", folderId, INITIAL_PAGE, PAGE_LIMIT],
      });
    },
    onError: (uploadError) => {
      setToast({
        open: true,
        message: getApiErrorMessage(uploadError),
        type: "error",
      });
    },
  });

  const renameFolderMutation = useMutation({
    mutationFn: async () => {
      if (!folderId) throw new Error("Folder id not found");
      const trimmedName = renameFolderName.trim();
      if (!trimmedName) throw new Error("Folder name is required");
      return renameFolderApi(folderId, { name: trimmedName });
    },
    onSuccess: () => {
      const updatedFolderName = renameFolderName.trim();
      setFolderName(updatedFolderName);
      setIsRenameModalOpen(false);
      setRenameError("");
      setToast({
        open: true,
        message: "Folder renamed successfully",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["personalFolders"] });
      router.replace(
        `/personal-storage/${folderId}?name=${encodeURIComponent(updatedFolderName)}`,
      );
    },
    onError: (renameErrorResponse) => {
      setToast({
        open: true,
        message: getApiErrorMessage(renameErrorResponse),
        type: "error",
      });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async () => {
      if (!folderId) throw new Error("Folder id not found");
      return deleteFolderApi(folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personalFolders"] });
      router.push("/Profile?tab=space");
    },
    onError: (deleteError) => {
      setToast({
        open: true,
        message: getApiErrorMessage(deleteError),
        type: "error",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async () => {
      if (!folderId || !selectedImage?._id) throw new Error("Image not found");
      return deleteFolderImageApi(folderId, selectedImage._id);
    },
    onSuccess: () => {
      setIsDeleteImageModalOpen(false);
      setSelectedImage(null);
      setToast({
        open: true,
        message: "Image deleted successfully",
        type: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["folder-images", folderId, INITIAL_PAGE, PAGE_LIMIT],
      });
      queryClient.invalidateQueries({ queryKey: ["personalFolders"] });
    },
    onError: (deleteImageError) => {
      setToast({
        open: true,
        message: getApiErrorMessage(deleteImageError),
        type: "error",
      });
    },
  });

  useEffect(() => {
    const urls = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviewUrls(urls);

    return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
  }, [selectedFiles]);

  const [activeImageOptionsId, setActiveImageOptionsId] = useState<
    string | null
  >(null);

  const handleMakePost = (image: any) => {
    const imageUrl = image.location || FALLBACK_IMAGE_URL;
    executeWithCheck(() => {
      router.push(
        `/Createdpost?fileId=${image._id}&imageUrl=${encodeURIComponent(imageUrl)}`,
      );
    });
  };

  const openDeleteModal = (image: any) => {
    setSelectedImage({
      _id: image._id,
      url: image.location || FALLBACK_IMAGE_URL,
    });
    setIsDeleteImageModalOpen(true);
    setActiveImageOptionsId(null);
  };

  const handleDownloadPreviewImage = async () => {
    if (!previewImage || isDownloadingPreview) return;

    setIsDownloadingPreview(true);
    try {
      const fileUrl = `${previewImage.url}${
        previewImage.url.includes("?") ? "&" : "?"
      }t=${Date.now()}`;
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = previewImage.downloadName || previewImage.alt || "image";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

      setToast({
        open: true,
        message: "Image downloaded successfully.",
        type: "success",
      });
    } catch {
      setToast({
        open: true,
        message: "Failed to download image. Please try again.",
        type: "error",
      });
    } finally {
      setIsDownloadingPreview(false);
    }
  };

  const handleDownloadSelectedImages = async () => {
    if (selectedForDownload.length === 0 || isDownloadingMultiple) return;
    setIsDownloadingMultiple(true);

    let downloadedCount = 0;
    try {
      setToast({
        open: true,
        message: "Starting downloads...",
        type: "success",
      });

      for (const image of selectedForDownload) {
        let fileUrl = image.location;
        if (!fileUrl) continue;

        fileUrl = `${fileUrl}${fileUrl.includes("?") ? "&" : "?"}t=${new Date().getTime()}`;
        const fileName = image.filename || "download";

        const responseBlob = await fetch(fileUrl);
        if (!responseBlob.ok) continue;

        const blob = await responseBlob.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        downloadedCount++;
        // Small delay to prevent browser from blocking multiple downloads
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setToast({
        open: true,
        message: `Successfully downloaded ${downloadedCount} images.`,
        type: "success",
      });
      setIsSelectMode(false);
      setSelectedForDownload([]);
    } catch (error) {
      setToast({
        open: true,
        message: "Failed to download some images.",
        type: "error",
      });
    } finally {
      setIsDownloadingMultiple(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!actionsMenuRef.current) return;
      if (!actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }

      // Close image options menu if clicked outside
      if (
        activeImageOptionsId &&
        !(event.target as HTMLElement).closest(".image-options-container")
      ) {
        setActiveImageOptionsId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeImageOptionsId]);

  useEffect(() => {
    if (!previewImage) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewImage]);

  const handleSelectFiles = (files: FileList | null) => {
    if (!files) return;

    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/svg+xml",
    ];

    const newFiles = Array.from(files);

    // Filter valid files
    const validFiles = newFiles.filter((file) => {
      if (!allowedMimeTypes.includes(file.type)) return false;
      if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) return false;
      return true;
    });

    if (validFiles.length < newFiles.length) {
      setFileError(
        "Some files were skipped because they are not valid images or exceed 4MB.",
      );
    } else {
      setFileError("");
    }

    setSelectedFiles((prev) => {
      const combined = [...prev, ...validFiles];
      if (combined.length > 20) {
        setFileError("You can only upload up to 20 images at once.");
        return combined.slice(0, 20);
      }
      return combined;
    });
  };

  const handleRemoveSelectedFile = (fileToRemove: File) => {
    if (uploadImageMutation.isPending) return;
    setSelectedFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  return (
    <>
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((previous) => ({ ...previous, open: false }))}
      />
      <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
        <Header title={folderName} subtitle={`${folderImages.length} images`} />

        <div className="px-6 py-4">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            <div className="flex gap-3">
              {isSelectMode && selectedForDownload.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadSelectedImages}
                  disabled={isDownloadingMultiple}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-60"
                >
                  {isDownloadingMultiple ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download ({selectedForDownload.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsSelectMode((prev) => !prev);
                  setSelectedForDownload([]);
                }}
                className={`inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold text-white transition-colors ${
                  isSelectMode
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                {isSelectMode ? "Cancel" : "Select"}
              </button>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-[10px] bg-blue-500 px-2 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div ref={actionsMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsActionsOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-blue-500 px-2 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                  <EllipsisVertical className="h-4 w-4" />
                </button>

                {isActionsOpen ? (
                  <div className="absolute right-0 top-11 z-30 min-w-[170px] rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsOpen(false);
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete Folder
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsOpen(false);
                        setRenameFolderName(folderName);
                        setRenameError("");
                        setIsRenameModalOpen(true);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Rename Folder
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 auto-rows-[120px] gap-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className={`${index % 5 === 0 || index % 7 === 0 ? "row-span-2" : "row-span-3"} rounded-[28px] bg-gray-100 animate-pulse`}
                />
              ))}
            </div>
          ) : isError ? (
            <div className="py-10 text-center">
              <p className="text-red-600 font-medium">
                {getApiErrorMessage(error)}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : folderImages.length === 0 ? (
            <div className="min-h-[420px] flex flex-col items-center justify-center text-center">
              <div className="relative h-48 w-48 md:h-56 md:w-56">
                <Image
                  src="/images/no data found.jpg"
                  alt="No data found"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-4 text-gray-600 font-medium">
                No Images Found In This Folder
              </p>
            </div>
          ) : (
            <div className="max-w-[1400px] mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 auto-rows-[120px] gap-6">
                {folderImages.map((image, index) => {
                  const isTall = index % 5 === 0 || index % 7 === 0;
                  const imageUrl = image.location || FALLBACK_IMAGE_URL;

                  return (
                    <div
                      key={image._id || `${image.filename}-${index}`}
                      className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl group ${isTall ? "row-span-2" : "row-span-3"}`}
                    >
                      <img
                        src={imageUrl}
                        alt={image.filename || "Folder image"}
                        onClick={() => {
                          if (isSelectMode) {
                            setSelectedForDownload((prev) => {
                              const isSelected = prev.some(
                                (img) => img._id === image._id,
                              );
                              if (isSelected)
                                return prev.filter(
                                  (img) => img._id !== image._id,
                                );
                              return [...prev, image];
                            });
                          } else {
                            setPreviewImage({
                              url: imageUrl,
                              alt: image.filename || "Folder image",
                              downloadName: image.filename || undefined,
                            });
                          }
                        }}
                        className={`absolute inset-0 h-full w-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105 ${
                          isSelectMode &&
                          selectedForDownload.some(
                            (img) => img._id === image._id,
                          )
                            ? "border-4 rounded-[28px] border-blue-500 opacity-80"
                            : ""
                        }`}
                        loading="lazy"
                        onError={(event) => {
                          const target = event.currentTarget;
                          if (target.src !== FALLBACK_IMAGE_URL) {
                            target.src = FALLBACK_IMAGE_URL;
                          }
                        }}
                      />

                      {/* Image Options Button */}
                      <div className="absolute top-2 right-2 z-10 image-options-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageOptionsId(
                              activeImageOptionsId === image._id
                                ? null
                                : image._id,
                            );
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
                        >
                          <EllipsisVertical className="w-4 h-4" />
                        </button>

                        {activeImageOptionsId === image._id && (
                          <div className="absolute right-0 top-9 w-32 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-100 origin-top-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMakePost(image);
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Plus className="w-3.5 h-3.5 text-blue-500" />
                              Make Post
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(image);
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 border-t border-gray-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {previewImage ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setPreviewImage(null)}
          role="presentation"
        >
          <div className="absolute right-4 top-4 z-[110] flex items-center gap-2">
            <button
              type="button"
              disabled={isDownloadingPreview}
              onClick={(event) => {
                event.stopPropagation();
                void handleDownloadPreviewImage();
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Download image"
            >
              {isDownloadingPreview ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Download className="h-6 w-6" />
              )}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setPreviewImage(null);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
              aria-label="Close image preview"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <img
            src={previewImage.url}
            alt={previewImage.alt}
            className="max-h-[92vh] max-w-[96vw] rounded-2xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}

      {isUploadModalOpen ? (
        <div
          className="fixed  inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (uploadImageMutation.isPending) return;
            setIsUploadModalOpen(false);
            setFileError("");
          }}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Upload image to folder
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (uploadImageMutation.isPending) return;
                  setIsUploadModalOpen(false);
                  setFileError("");
                }}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                X
              </button>
            </div>

            {selectedFiles.length === 0 ? (
              <label className="mb-3 relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-600 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/svg+xml"
                  className="hidden"
                  multiple={true}
                  onChange={(event) => handleSelectFiles(event.target.files)}
                />
                <span className="relative z-10 px-4 text-gray-600">
                  Click to select images (Up to 20)
                </span>
              </label>
            ) : (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedFiles.length}/20 images selected
                  </span>
                  {selectedFiles.length < 20 && (
                    <label className="cursor-pointer text-sm font-semibold text-blue-500 hover:text-blue-600">
                      Add more
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/svg+xml"
                        className="hidden"
                        multiple={true}
                        onChange={(event) =>
                          handleSelectFiles(event.target.files)
                        }
                      />
                    </label>
                  )}
                </div>
                <div
                  className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {previewUrls.map(({ file, url }, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-200"
                    >
                      <img
                        src={url}
                        alt={`Preview ${i}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveSelectedFile(file);
                        }}
                        disabled={uploadImageMutation.isPending}
                        className="absolute right-1 top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-gray-500"
                        aria-label="Remove selected image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fileError ? (
              <p className="mb-3 text-xs font-semibold text-red-500">
                {fileError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={
                selectedFiles.length === 0 || uploadImageMutation.isPending
              }
              onClick={() => uploadImageMutation.mutate()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {uploadImageMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Images
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

      {isDeleteModalOpen ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (deleteFolderMutation.isPending) return;
            setIsDeleteModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-[22px] bg-white shadow-[0_6px_40px_rgba(0,0,0,0.1)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-[112px] bg-blue-100 bg-[linear-gradient(134.74deg,rgba(108,172,223,0.2)_3.24%,rgba(0,0,254,0.2)_139.86%),#fff]" />

            <div className="absolute left-1/2 top-[18px]  flex h-[74px] w-[74px] -translate-x-1/2 items-center justify-center rounded-full border border-[#EE3131] bg-[rgba(238,49,49,0.2)]">
              <Trash2 className="h-8 w-8 text-[#EE3131]" />
            </div>

            <div className="px-6 pb-6 pt-5 text-center">
              <h2 className="text-[28px] font-black tracking-[-0.02em] text-black">
                Deleted Folder!
              </h2>
              <p className="mt-1 text-[16px] leading-6 text-[#838383]">
                Are you sure you want to delete this storage folder?
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => deleteFolderMutation.mutate()}
                  disabled={deleteFolderMutation.isPending}
                  className="flex h-12 flex-1 items-center justify-center rounded-[12px] bg-[linear-gradient(134.74deg,#6CACDF_3.24%,#0000FE_139.86%)] text-[17px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteFolderMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteFolderMutation.isPending}
                  className="flex h-12 flex-1 items-center justify-center rounded-[12px] bg-[linear-gradient(134.74deg,#CBFE8B_3.24%,#81DE76_111.16%)] text-[17px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteImageModalOpen ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (deleteImageMutation.isPending) return;
            setIsDeleteImageModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-[22px] bg-white shadow-[0_6px_40px_rgba(0,0,0,0.1)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-[112px] bg-[linear-gradient(134.74deg,rgba(108,172,223,0.2)_3.24%,rgba(0,0,254,0.2)_139.86%),#fff]" />

            <div className="absolute left-1/2 top-[18px] flex h-[74px] w-[74px] -translate-x-1/2 items-center justify-center rounded-full border border-[#EE3131] bg-[rgba(238,49,49,0.2)]">
              <Trash2 className="h-8 w-8 text-[#EE3131]" />
            </div>

            <div className="px-6 pb-6 pt-5 text-center">
              <h2 className="text-[28px] font-black tracking-[-0.02em] text-black">
                Delete Image?
              </h2>
              <p className="mt-1 text-[16px] leading-6 text-[#838383]">
                Are you sure you want to delete this image from this folder?
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => deleteImageMutation.mutate()}
                  disabled={deleteImageMutation.isPending}
                  className="flex h-12 flex-1 items-center justify-center rounded-[12px] bg-[linear-gradient(134.74deg,#6CACDF_3.24%,#0000FE_139.86%)] text-[17px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteImageMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteImageModalOpen(false)}
                  disabled={deleteImageMutation.isPending}
                  className="flex h-12 flex-1 items-center justify-center rounded-[12px] bg-[linear-gradient(134.74deg,#CBFE8B_3.24%,#81DE76_111.16%)] text-[17px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isRenameModalOpen ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (renameFolderMutation.isPending) return;
            setIsRenameModalOpen(false);
            setRenameError("");
          }}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Rename folder</h2>
              <button
                type="button"
                onClick={() => {
                  if (renameFolderMutation.isPending) return;
                  setIsRenameModalOpen(false);
                  setRenameError("");
                }}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              type="text"
              maxLength={80}
              value={renameFolderName}
              onChange={(event) => {
                setRenameFolderName(event.target.value);
                setRenameError("");
              }}
              placeholder="Enter folder name"
              className="mb-3 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-800 outline-none focus:border-blue-400"
            />

            {renameError ? (
              <p className="mb-2 text-xs font-semibold text-red-500">
                {renameError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={renameFolderMutation.isPending}
              onClick={() => {
                const trimmedName = renameFolderName.trim();
                if (!trimmedName) {
                  setRenameError("Folder name is required.");
                  return;
                }
                renameFolderMutation.mutate();
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-500 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {renameFolderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Name"
              )}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
