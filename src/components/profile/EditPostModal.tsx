"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updatePostApi } from "@/services/postApi";
import { getCategoriesApi } from "@/services/authApi";
import Image from "next/image";

interface Post {
  id?: string;
  _id?: string;
  media?: { location: string } | string;
  caption?: string;
  categories?: Array<{ id?: string; _id?: string; name: string }>;
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

  const [caption, setCaption] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Pre-fill form when post changes
  useEffect(() => {
    if (post) {
      setCaption(post.caption || "");
      const catIds = (post.categories || []).map((c) => c.id || c._id || "").filter(Boolean);
      setSelectedCategories(catIds);
      setNewImage(null);
      setImagePreview(null);
    }
  }, [post]);

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoriesApi({ limit: 100 }),
    enabled: isOpen,
  });
  const categories = categoriesData?.data?.results || categoriesData?.data || [];

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
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

  const handleSubmit = () => {
    const data = new FormData();
    data.append("caption", caption);
    selectedCategories.forEach((catId, index) => {
      data.append(`categories[${index}]`, catId);
    });
    if (newImage) {
      data.append("media", newImage);
    }
    mutate(data);
  };

  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Post</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/70 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          {/* Image Preview */}
          <div className="relative">
            <div
              className="relative w-full h-48 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {currentImage ? (
                <Image src={currentImage} alt="Post" fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm">No image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                <span className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
                  Change Image
                </span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="Describe your photo..."
              className="w-full px-4 py-3 bg-blue-50 border-0 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categoriesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-gray-100 animate-pulse rounded-full" />
                ))
              ) : (
                categories.map((cat: any) => {
                  const catId = cat.id || cat._id;
                  const isSelected = selectedCategories.includes(catId);
                  return (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => toggleCategory(catId)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        isSelected
                          ? "gradient-bg text-white border-none shadow-md"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Error */}
          {isError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              <span className="font-medium">Error:</span>{" "}
              {(error as any)?.response?.data?.message || "Failed to update post. Please try again."}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold rounded-full hover:from-blue-500 hover:to-purple-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
