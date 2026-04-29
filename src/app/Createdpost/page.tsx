"use client";
import Imagepage from "@/components/createpost/Imagepage";
import Header from "@/components/global/header";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCategoriesApi } from "@/services/authApi";
import { createPostApi } from "@/services/postApi";
import { CategoryChipSkeleton } from "@/components/global/Skeletons";
import { useRouter } from "next/navigation";
import ContentReleaseModal from "@/components/global/ContentReleaseModal";
import Link from "next/link";

interface UploadFormProps {
  onGenerate?: (data: any) => void;
}

interface FormData {
  image: File | null;
  caption: string;
  agreedToTerms: boolean;
  categories: string[];
}

const UploadForm: React.FC<UploadFormProps> = ({ onGenerate }) => {
  const [formData, setFormData] = useState<FormData>({
    image: null,
    caption: "",
    agreedToTerms: false,
    categories: [],
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImage, setIsImage] = useState<boolean>(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const router = useRouter();
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

  // Create post mutation
  const { mutate, status, error, reset } = useMutation({
    mutationFn: createPostApi,
    onSuccess: (data) => {
      console.log("Post created successfully:", data);
      router.push("/Profile?tab=posts")
      // Success handling is done inside the AnalyzingModal via the onSuccess prop
    },
    onError: (err) => {
      console.error("Error creating post:", err);
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    reset();
  };

  const handleGenerate = () => {
    if (!formData.image) return;

    const data = new FormData();

    if (formData.image) {
      data.append("media", formData.image);
    }
    data.append("caption", formData.caption);
    formData.categories.forEach((catId, index) => {
      data.append(`categories[${index}]`, catId);
    });
    // data.append("isContentReleaseAccepted", formData.agreedToTerms.toString());
    const values = Object.fromEntries(data.entries());
    console.log(values, "form-->data--->");
    // setIsImage(true);
    mutate(data);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  return (
    <div className="min-h-screen">
      <Header title={"Create Post"} subtitle={""} />
      {isImage ? (
        <Imagepage
          handleRemoveImage={handleRemoveImage}
          preview={imagePreview}
          setIsImage={setIsImage}
          handleImageUpload={handleImageUpload}
          status={status}
          onSuccess={() => {
            // After successful AI verification
            reset();
            setIsImage(false);
            setFormData({
              image: null,
              caption: "",
              agreedToTerms: false,
              categories: [],
            });
            setImagePreview(null);

          }}
        />
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 m-4">
          {/* Header */}
          <div className="flex items-start  mb-6">
            <button
              onClick={() => window.history.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6"
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
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-lg font-medium mb-2">
                Upload Picture you want to create post
              </h1>
              <p className="text-sm text-gray-600 text-center">
                Our AI ensures every picture is original, no humans, no
                AI-generated images, You can even use the AI tool to remove
                humans from your own clicks before posting.
              </p>
            </div>
          </div>

          <div className="mb-4 ">
            {imagePreview && (
              <div className="mt-4 flex justify-center">
                <div className=" w-70 h-70 group relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl border shadow-sm"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0  rounded-xl  flex items-start justify-end  p-2">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:scale-110 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!imagePreview && (
              <label
                htmlFor="image-upload"
                className="relative block w-full border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl p-12 text-center cursor-pointer group hover:bg-blue-100 transition-colors"
              >
                <div className="text-xs text-gray-500">
                  <div className="text-blue-600 font-medium mb-1">
                    Upload Picture
                  </div>
                  Max Limit 5Mbs, PNG, JPG, JPEG
                </div>

                <input
                  id="image-upload"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {/* Destination Input */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-sm font-bold text-gray-700">Caption</label>

            </div>
            <textarea
              placeholder="Enter Caption"
              value={formData.caption}
              maxLength={150}
              rows={3}
              onChange={(e) =>
                setFormData({ ...formData, caption: e.target.value })
              }
              className="w-full px-4 py-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
            <p className={`text-xs flex justify-end  ${formData.caption.length >= 150 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.caption.length}/150
            </p>
          </div>

          {/* fetch Categories Here */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
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
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${isSelected
                        ? "gradient-bg text-white border-none shadow-md"
                        : "bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-200"
                        }`}
                    >
                      {cat.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Checkbox */}
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
              <span className="ml-3 text-sm text-gray-600">
                By uploading any images, you are granting a license to Frame The World LLC, as set forth in the
                <Link href="https://www.frametheworld.org/terms-condition" className="underline text-blue-600 hover:text-blue-800 transition-colors"> Terms of Service</Link>
              </span>
            </label>
          </div>

          <ContentReleaseModal
            isOpen={isReleaseModalOpen}
            onClose={() => setIsReleaseModalOpen(false)}
          />

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={
              !formData.image ||
              !formData.agreedToTerms ||
              formData.categories.length === 0 ||
              status === "pending"
            }
            className="w-full py-4 bg-gradient-to-r from-blue-400 to-purple-400 text-white font-medium rounded-full hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "pending" ? "Posting..." : "Post"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
