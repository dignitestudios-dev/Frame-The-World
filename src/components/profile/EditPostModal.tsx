"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updatePostApi } from "@/services/postApi";
import { getCategoriesApi } from "@/services/authApi";
import Image from "next/image";
import LocationAutocomplete from "@/components/global/LocationAutocomplete";
import ContentReleaseModal from "@/components/global/ContentReleaseModal";
import DiscardUploadModal from "../createpost/DiscardUploadModal";

interface Post {
  id?: string;
  _id?: string;
  media?: { location: string } | string;
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
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      setNewImage(null);
      setImagePreview(null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCaption = () => {
    setCaption("");
  };

  const postId = post?.id || post?._id || "";
  const currentImage =
    imagePreview ||
    (typeof post?.media === "string" ? post.media : post?.media?.location) ||
    null;

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (formData: FormData) => updatePostApi(postId, formData),
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
    const data = new FormData();
    if (!isReuploadOnly) {
      data.append("status", "completed");
      data.append("country", locationData?.country || "");
      data.append("state", locationData?.state || "");
      data.append("latitude", locationData?.latitude?.toString() || "");
      data.append("longitude", locationData?.longitude?.toString() || "");
      data.append("isContentReleaseAccepted", true.toString());
    } else {
      // For re-upload, we might want to set status back to pending or something
      // data.append("status", "pending");
    }
    if (newImage) {
      data.append("media", newImage);
    }
    mutate(data);
  };

  if (!isOpen || !post) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[99] flex items-start justify-center bg-black/40 backdrop-blur-md p-4"
        onClick={() => { setIsDiscardModalOpen(true) }}
      >
        <div
          className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              {isReuploadOnly ? "Update Rejected Post" : "Edit Post"}
            </h2>
            <button
              onClick={() => { setIsDiscardModalOpen(true) }}
              className="p-2 rounded-full hover:bg-white/70 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
            {/* Image Preview (Read-only) */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`${!isReuploadOnly ? "cursor-not-allowed" : "cursor-pointer hover:border-blue-400"} relative w-full h-48 rounded-2xl  bg-gray-100 group border-2 border-dashed border-transparent transition-all `}
            >
              {currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt="Post"
                    className="w-full h-[140px] rounded-md object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {
                    !isReuploadOnly ? <></> : <>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 p-2 rounded-full shadow-lg">
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </>
                  }

                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm">Click to upload image</span>
                </div>
              )}
            </div>
            {/* Keeping ref for compatibility if needed, but not functional */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleImageChange}
              className="hidden"
              disabled={!isReuploadOnly}
            />
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

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 w-full py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold rounded-full hover:from-blue-500 hover:to-purple-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
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
