"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCategoriesApi, updateUserApi } from "@/services/authApi";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/lib/apiError";
import { CategoryChipSkeleton } from "@/components/global/Skeletons";

export default function CategoryPreferences() {
  const { user, updateUser } = useAuthStore();

  // Set initial selected categories from user if they exist
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const [visibleCount, setVisibleCount] = useState(20);

  // Load existing user preferences
  useEffect(() => {
    if (user?.categoryPreference) {
      const existingIds = user.categoryPreference.map((cat: any) =>
        typeof cat === 'string' ? cat : (cat.id || cat._id)
      ).filter(Boolean);
      setSelectedCategories(existingIds);
    }
  }, [user]);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoriesApi({ limit: 100 }), // Keep fetching up to 100 but paginate locally, or change limit to a larger num if needed
  });

  const categories = categoriesData?.data?.results || categoriesData?.data || [];
  const visibleCategories = categories.slice(0, visibleCount);
  const hasMoreCategories = visibleCount < categories.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const { mutate, isPending } = useMutation({
    // Using updateUserApi since we are in settings editing profile, not completing onboarding
    mutationFn: updateUserApi,
    onSuccess: (data) => {
      setToastMessage(data?.message || "Preferences updated successfully!");
      setToastType("success");
      setToastOpen(true);
      if (data?.data) {
        updateUser(data?.data);
      }
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

    // Since updateUserApi accepts categoryPreference strings
    selectedCategories.forEach((id) => {
      formData.append("categoryPreference", id);
    });

    mutate(formData);
  };

  return (
    <div className="flex-1 rounded-3xl bg-white p-6 md:p-12 shadow min-h-[40em]">
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      {/* Title Section */}
      <div className="text-center mb-10 max-w-sm mx-auto">
        <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
          Content Categories & Feed Personalization
        </h1>
        <p className="text-[12px] font-medium text-gray-400">
          Choose at least 3 categories so we can personalize your feed with content you'll love.
        </p>
      </div>

      {/* Categories Chip Cloud */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 min-h-[8em]">
        {categoriesLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <CategoryChipSkeleton key={i} />
          ))
        ) : (
          visibleCategories.map((cat: any) => {
            const isSelected = selectedCategories.includes(cat.id || cat._id);
            return (
              <button
                key={cat.id || cat._id}
                type="button"
                onClick={() => toggleCategory(cat.id || cat._id)}
                className={`px-5 py-2.5 rounded-full text-[12px] font-semibold transition-all border-none ${isSelected
                  ? "bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white shadow-lg shadow-[#3B54F0]/30"
                  : "bg-[#F4F5F7] text-[#1D1E20] hover:bg-[#EAEBEF]"
                  }`}
              >
                {cat.name}
              </button>
            );
          })
        )}
      </div>

      {/* Load More Button */}
      {hasMoreCategories && (
        <div className="flex justify-end mb-6 max-w-lg mx-auto w-full px-4">
          <button
            type="button"
            onClick={handleLoadMore}
            className="text-[13px] font-bold text-[#5D92F3] hover:underline"
          >
            Load More
          </button>
        </div>
      )}

      <div className="border-t border-gray-100 mb-6 max-w-lg mx-auto w-full"></div>

      {/* Info Text */}
      <div className="mb-10 flex gap-2 justify-center max-w-lg mx-auto w-full px-4 items-start">
        <div className="flex-shrink-0 mt-0.5">
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#5D92F3] text-white shadow-sm">
            <span className="text-[11px] font-black italic">i</span>
          </div>
        </div>
        <p className="text-[12px] text-gray-600 leading-relaxed max-w-[28em]">
          If the user does not select any interest categories, the system will display a mixed discovery feed containing content from multiple categories.
        </p>
      </div>

      {/* Submit Button */}
      <div className="max-w-[28em] mx-auto">
        <Button
          onClick={handleSubmit}
          disabled={isPending || selectedCategories.length < 3}
          className={`w-full h-14 rounded-full font-bold text-base transition-all tracking-tight ${isPending || selectedCategories.length < 3
            ? "bg-[#F4F5F7] text-gray-400 cursor-not-allowed shadow-none hover:bg-[#F4F5F7]"
            : "bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white hover:opacity-90 shadow-lg shadow-[#3B54F0]/20"
            }`}
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
