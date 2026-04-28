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
import { Plus, Upload, Loader2, X, EllipsisVertical, Trash2 } from "lucide-react";

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
  const params = useParams<{ folderId: string }>();
  const searchParams = useSearchParams();
  const folderId = params?.folderId;
  const initialFolderName = searchParams.get("name") || "Folder Images";
  const [folderName, setFolderName] = useState(initialFolderName);
  const [selectedImage, setSelectedImage] = useState<{ _id: string; url: string } | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteImageModalOpen, setIsDeleteImageModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameFolderName, setRenameFolderName] = useState(initialFolderName);
  const [renameError, setRenameError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
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
    queryFn: () => getFolderImagesApi(folderId, { page: INITIAL_PAGE, limit: PAGE_LIMIT }),
    enabled: Boolean(folderId),
  });

  const folderImages = (data?.data || []).filter((image) => isImageUrl(image?.location));

  const uploadImageMutation = useMutation({
    mutationFn: async () => {
      if (!folderId || !selectedFile) {
        throw new Error("Please select an image to upload.");
      }
      return uploadImageToFolderApi(folderId, selectedFile);
    },
    onSuccess: () => {
      setToast({
        open: true,
        message: "Image uploaded successfully",
        type: "success",
      });
      setIsUploadModalOpen(false);
      setSelectedFile(null);
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
      router.replace(`/personal-storage/${folderId}?name=${encodeURIComponent(updatedFolderName)}`);
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
    if (!selectedFile) {
      setSelectedFilePreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setSelectedFilePreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedFile]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!actionsMenuRef.current) return;
      if (!actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectFile = (file: File | undefined) => {
    if (!file) return;

    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/svg+xml",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      setSelectedFile(null);
      setFileError("Only image files are allowed (PNG, JPEG, JPG, WEBP, GIF, BMP, SVG).");
      return;
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setFileError("Image size must be 4MB or less.");
      return;
    }

    setSelectedFile(file);
    setFileError("");
  };

  const handleRemoveSelectedFile = () => {
    if (uploadImageMutation.isPending) return;
    setSelectedFile(null);
    setFileError("");
  };

  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((previous) => ({ ...previous, open: false }))}
      />

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

<div className="flex gap-3">
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
            <p className="text-red-600 font-medium">{getApiErrorMessage(error)}</p>
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
              <Image src="/images/no data found.jpg" alt="No data found" fill className="object-contain" />
            </div>
            <p className="mt-4 text-gray-600 font-medium">No images found in this folder</p>
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
                    onClick={() => setSelectedImage({ _id: image._id, url: imageUrl })}
                    className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl cursor-pointer ${isTall ? "row-span-2" : "row-span-3"}`}
                  >
                    <img
                      src={imageUrl}
                      alt={image.filename || "Folder image"}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        const target = event.currentTarget;
                        if (target.src !== FALLBACK_IMAGE_URL) {
                          target.src = FALLBACK_IMAGE_URL;
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsDeleteImageModalOpen(true);
            }}
            className="absolute right-20 top-6 h-10 w-10 rounded-full bg-red-500/90 text-white hover:bg-red-600"
            aria-label="Delete image"
          >
            <Trash2 className="mx-auto h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-6 top-6 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
            aria-label="Close image preview"
          >
            <X className="mx-auto h-5 w-5" />
          </button>

          <img
            src={selectedImage.url}
            alt="Selected folder image"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}

      {isUploadModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (uploadImageMutation.isPending) return;
            setIsUploadModalOpen(false);
            setFileError("");
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Upload image to folder</h2>
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

            <label
              className="mb-3 relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              style={
                selectedFilePreviewUrl
                  ? {
                      backgroundImage: `url(${selectedFilePreviewUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/svg+xml"
                className="hidden"
                onChange={(event) => handleSelectFile(event.target.files?.[0])}
              />
              {!selectedFilePreviewUrl ? (
                <span className="relative z-10 px-4 text-gray-600">
                  Click to select image (PNG, JPEG, WEBP, etc.)
                </span>
              ) : null}

              {selectedFilePreviewUrl ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleRemoveSelectedFile();
                  }}
                  disabled={uploadImageMutation.isPending}
                  className="absolute right-2 top-2 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/70 disabled:cursor-not-allowed disabled:bg-gray-500"
                  aria-label="Remove selected image"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>

            {fileError ? <p className="mb-3 text-xs font-semibold text-red-500">{fileError}</p> : null}

            <button
              type="button"
              disabled={!selectedFile || uploadImageMutation.isPending}
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
                  Upload Image
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

      {isDeleteModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (deleteFolderMutation.isPending) return;
            setIsDeleteModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-[390px] overflow-hidden rounded-[22px] bg-white shadow-[0_6px_40px_rgba(0,0,0,0.1)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-[112px] bg-[linear-gradient(134.74deg,rgba(108,172,223,0.2)_3.24%,rgba(0,0,254,0.2)_139.86%),#fff]" />

            <div className="absolute left-1/2 top-[18px] flex h-[74px] w-[74px] -translate-x-1/2 items-center justify-center rounded-full border border-[#EE3131] bg-[rgba(238,49,49,0.2)]">
              <Trash2 className="h-8 w-8 text-[#EE3131]" />
            </div>

            <div className="px-6 pb-6 pt-5 text-center">
              <h2 className="text-[28px] font-black tracking-[-0.02em] text-black">Deleted Folder!</h2>
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
                  {deleteFolderMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Delete"}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (deleteImageMutation.isPending) return;
            setIsDeleteImageModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-[390px] overflow-hidden rounded-[22px] bg-white shadow-[0_6px_40px_rgba(0,0,0,0.1)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-[112px] bg-[linear-gradient(134.74deg,rgba(108,172,223,0.2)_3.24%,rgba(0,0,254,0.2)_139.86%),#fff]" />

            <div className="absolute left-1/2 top-[18px] flex h-[74px] w-[74px] -translate-x-1/2 items-center justify-center rounded-full border border-[#EE3131] bg-[rgba(238,49,49,0.2)]">
              <Trash2 className="h-8 w-8 text-[#EE3131]" />
            </div>

            <div className="px-6 pb-6 pt-5 text-center">
              <h2 className="text-[28px] font-black tracking-[-0.02em] text-black">Delete Image?</h2>
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
                  {deleteImageMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Delete"}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (renameFolderMutation.isPending) return;
            setIsRenameModalOpen(false);
            setRenameError("");
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
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

            {renameError ? <p className="mb-2 text-xs font-semibold text-red-500">{renameError}</p> : null}

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
    </div>
  );
}
