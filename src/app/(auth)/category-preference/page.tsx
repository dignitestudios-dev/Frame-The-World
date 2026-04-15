"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { ArrowLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { completeProfileApi, getCategoriesApi } from "@/services/authApi";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/lib/apiError";
import { CategoryChipSkeleton } from "@/components/global/Skeletons";

export default function CategoryPreferencePage() {
  const router = useRouter();
  const { user, tempProfileData, updateUser, clearAuthFlow } = useAuthStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoriesApi({ limit: 100 }),
  });

  const categories = categoriesData?.data?.results || categoriesData?.data || [];

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const { mutate, isPending } = useMutation({
    mutationFn: completeProfileApi,
    onSuccess: (data) => {
      setToastMessage(data?.message || "Profile completed successfully!");
      setToastType("success");
      setToastOpen(true);
      console.log(data,"data---data")
      if (data?.data) {
        updateUser(data?.data);
      }
      router.push("/verify-credentials");

      clearAuthFlow();

    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const handleSubmit = () => {
    if (selectedCategories.length < 3) {
      setToastMessage("Please select at least 3 categories to personalize your feed");
      setToastType("error");
      setToastOpen(true);
      return;
    }

    const formData = new FormData();

    if (tempProfileData) {
      formData.append("name", tempProfileData.fullName);
      if (tempProfileData.bio) formData.append("bio", tempProfileData.bio);
      if (tempProfileData.companyName) formData.append("company[name]", tempProfileData.companyName);
      if (tempProfileData.street) formData.append("company[address][street]", tempProfileData.street);
      if (tempProfileData.city) formData.append("company[address][city]", tempProfileData.city);
      if (tempProfileData.country) formData.append("company[address][country]", tempProfileData.country);
      if (tempProfileData.avatarFile) {
        formData.append("profilePicture", tempProfileData.avatarFile);
      }
    }

    selectedCategories.forEach((id) => {
      formData.append("categoryPreference", id);
    });

    mutate(formData);
  };

  // Background images
  const bgImages = [
    "https://images.unsplash.com/photo-1500835595353-b0ad2e58b8df?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1433086566211-3729e28f32da?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&auto=format&fit=crop",
  ];

  if (!tempProfileData && !user?.isProfileCompleted) return null;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-end overflow-hidden p-6">
      {/* Background Masonry-like Grid */}
      <div className="absolute inset-0 -z-10 grid grid-cols-3 gap-2 opacity-10 blur-[1px] scale-110">
        {bgImages.map((src, i) => (
          <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-xl grayscale">
            <img src={src} alt="Travel bg" className="h-full w-full object-cover shadow-inner" />
          </div>
        ))}
      </div>

      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      <div className="relative w-full max-w-[42em] rounded-[2.5rem] bg-white p-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)] h-auto min-h-[40em]">
        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-900 transition-transform hover:scale-110 active:scale-95"
          >
            <ArrowLeft className="h-6 w-6 stroke-[3]" />
          </button>
          {/* <button
            type="button"
            onClick={() => router.push("/subscription")}
            className="text-xs font-black text-gray-900 hover:text-blue-600 transition-colors"
          >
            Skip
          </button> */}
        </div>

        {/* Title Section */}
        <div className="text-center mb-10 max-w-sm mx-auto">
          <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
            Categories & Feed Personalization
          </h1>
          <p className="text-[10px] font-medium text-gray-400">
            Choose at least 3 categories so we can personalize your feed with content you'll love.
          </p>
        </div>

        {/* Categories Chip Cloud */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 min-h-[8em]">
          {categoriesLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <CategoryChipSkeleton key={i} />
            ))
          ) : (
            categories.map((cat: any) => {
              const isSelected = selectedCategories.includes(cat.id || cat._id);
              return (
                <button
                  key={cat.id || cat._id}
                  type="button"
                  onClick={() => toggleCategory(cat.id || cat._id)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black transition-all border-none ${isSelected
                      ? "gradient-bg text-white shadow-lg shadow-blue-200"
                      : "bg-[#f4f4f4] text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {cat.name}
                </button>
              );
            })
          )}
        </div>

        {/* Info Text */}
        <div className="mb-10 flex gap-1.5 justify-center max-w-md mx-auto">
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
              <span className="text-[10px] font-black italic">i</span>
            </div>
          </div>
          <p className="text-[9px] font-medium text-gray-400 leading-relaxed max-w-[28em]">
            If the user does not select any interest categories, the system will display a mixed discovery feed containing content from multiple categories.
          </p>
        </div>

        {/* Submit Button */}
        <div className="max-w-[28em] mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={isPending || selectedCategories.length < 3}
            className={`w-full h-14 rounded-full font-bold text-base transition-all shadow-xl tracking-tight ${isPending || selectedCategories.length < 3
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90 shadow-blue-200"
              }`}
          >
            {isPending ? "Verifying..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
