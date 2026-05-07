"use client";

import { Search, X, SlidersHorizontal, Clock, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import Header from "@/components/global/header";
import LocationAutocomplete from "@/components/global/LocationAutocomplete";
import { getCategoriesApi } from "@/services/postApi";

const RECENT_SEARCHES_KEY = "search_recent_locations";

type Category = {
  _id?: string;
  id?: string;
  name: string;
};

const getCategoryId = (category: Category): string =>
  category._id || category.id || "";

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    latitude?: number;
    longitude?: number;
  } | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [draftCategoryIds, setDraftCategoryIds] = useState<string[]>([]);
  const {
    data: categoriesPages,
    isLoading: isCategoriesLoading,
    hasNextPage: hasMoreCategories,
    fetchNextPage: fetchMoreCategories,
    isFetchingNextPage: isLoadingMoreCategories,
  } = useInfiniteQuery({
    queryKey: ["search-categories"],
    queryFn: ({ pageParam }) => getCategoriesApi({ page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const currentPage = lastPage?.pagination?.currentPage ?? 1;
      const totalPages = lastPage?.pagination?.totalPages ?? 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const categories: Category[] =
    categoriesPages?.pages?.flatMap((page: any) =>
      Array.isArray(page?.data) ? (page.data as Category[]) : []
    ) ?? [];

  const getCategoryNameById = (categoryId: string) =>
    categories.find((category) => getCategoryId(category) === categoryId)?.name ??
    "Category";

  useEffect(() => {
    const storedRecentSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!storedRecentSearches) return;
    try {
      const parsedRecentSearches = JSON.parse(storedRecentSearches) as string[];
      if (Array.isArray(parsedRecentSearches)) {
        setRecentSearches(parsedRecentSearches);
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    setRecentSearches((previousSearches) => {
      const updatedSearches = [
        normalizedQuery,
        ...previousSearches.filter((item) => item.toLowerCase() !== normalizedQuery.toLowerCase()),
      ].slice(0, 8);

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
      return updatedSearches;
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const toggleDraftCategory = (categoryId: string) => {
    if (!categoryId) return;
    setDraftCategoryIds((previousIds) => {
      if (previousIds.includes(categoryId)) {
        return previousIds.filter((id) => id !== categoryId);
      }
      return [...previousIds, categoryId];
    });
  };

  const openFilterModal = () => {
    setDraftCategoryIds(selectedCategoryIds);
    setIsFilterOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setDraftCategoryIds([]);
  };

  const handleApplyFilters = () => {
    setSelectedCategoryIds(draftCategoryIds);
    setIsFilterOpen(false);
  };

  const resolveCoordinatesFromQuery = async (query: string) => {
    const results = await getGeocode({ address: query });
    if (!results?.length) return null;
    const { lat, lng } = await getLatLng(results[0]);
    return {
      latitude: lat,
      longitude: lng,
    };
  };

  const handleSearch = async (query?: string) => {
    const normalizedQuery = (query ?? searchQuery).trim();
    const hasCategories = selectedCategoryIds.length > 0;
    let coordinates =
      typeof selectedCoordinates?.latitude === "number" &&
      typeof selectedCoordinates?.longitude === "number"
        ? selectedCoordinates
        : null;

    if (!coordinates && normalizedQuery) {
      try {
        coordinates = await resolveCoordinatesFromQuery(normalizedQuery);
        if (coordinates) {
          setSelectedCoordinates(coordinates);
        }
      } catch {
        coordinates = null;
      }
    }

    const hasCoordinates =
      typeof coordinates?.latitude === "number" && typeof coordinates?.longitude === "number";

    if (!normalizedQuery && !hasCategories && !hasCoordinates) return;

    if (normalizedQuery) {
      saveRecentSearch(normalizedQuery);
    }

    const searchParams = new URLSearchParams();

    if (normalizedQuery) {
      searchParams.set("q", normalizedQuery);
    }

    if (typeof coordinates?.latitude === "number") {
      searchParams.set("latitude", String(coordinates.latitude));
    }

    if (typeof coordinates?.longitude === "number") {
      searchParams.set("longitude", String(coordinates.longitude));
    }

    selectedCategoryIds.forEach((categoryId) => {
      searchParams.append("categories", categoryId);
    });

    router.push(`/search/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Search title */}
      <Header />

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Search Input Area */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 relative">
            <LocationAutocomplete
              placeholder="Search location"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedCoordinates(null);
              }}
              onLocationSelect={(place) => {
                setSearchQuery(place.address);
                setSelectedCoordinates({
                  latitude: place.latitude,
                  longitude: place.longitude,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                }
              }}
              className="w-full pl-4 pr-24 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={openFilterModal}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-5 w-5 text-[#0000FE]" strokeWidth={2.2} />
            </button>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-10 top-1/2 z-10 -translate-y-1/2"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
            )}
          </div>
          {/* Search button */}
          <button
            type="button"
            onClick={() => handleSearch(searchQuery)}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md flex items-center justify-center hover:shadow-lg transition-shadow flex-shrink-0"
            aria-label="Search location"
          >
            <Search className="h-5 w-5 text-white" />
          </button>
        </div>

        {selectedCategoryIds.length > 0 && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-[#FAFAFA] p-3">
            <p className="mb-2 text-sm font-semibold text-gray-700">Selected Categories</p>
            <div className="flex flex-wrap gap-2">
              {selectedCategoryIds.map((categoryId) => (
                <span
                  key={categoryId}
                  className="rounded-full bg-gradient-to-br from-[#6CACDF] to-[#0000FE] px-3 py-1 text-xs font-semibold text-white"
                >
                  {getCategoryNameById(categoryId)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent</h2>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleSearch(search)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{search}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-blue-600" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[440px] rounded-[24px] bg-white shadow-2xl">
            <div className="relative rounded-t-[24px] bg-blue-100 px-4 py-6">
              <button
                type="button"
                onClick={closeFilterModal}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-700 hover:bg-white/60"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-center text-xl font-semibold text-[#000E08]">Interests/Categories</h3>
            </div>

            <div className="max-h-[520px] space-y-4 overflow-y-auto px-4 py-4">
              <section>
                <div className="rounded-2xl bg-[#FAFAFA] p-3">
                  {isCategoriesLoading ? (
                    <p className="text-sm text-gray-600">Loading categories...</p>
                  ) : categories.length === 0 ? (
                    <p className="text-sm text-gray-600">No item found</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const categoryId = getCategoryId(category);
                        if (!categoryId) return null;
                        const isSelected = draftCategoryIds.includes(categoryId);
                        return (
                          <button
                            key={categoryId}
                            type="button"
                            onClick={() => toggleDraftCategory(categoryId)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                              isSelected
                                ? "bg-gradient-to-br from-[#6CACDF] to-[#0000FE] text-white"
                                : "bg-[rgba(232,232,232,0.6)] text-[#575757]"
                            }`}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {hasMoreCategories && (
                  <button
                    type="button"
                    onClick={() => fetchMoreCategories()}
                    disabled={isLoadingMoreCategories}
                    className="mt-3 h-10 w-full rounded-full border border-[#0000FE] text-sm font-semibold text-[#0000FE] disabled:opacity-60"
                  >
                    {isLoadingMoreCategories ? "Loading..." : "Load More"}
                  </button>
                )}
              </section>
            </div>

            <div className="flex items-center gap-3 px-4 pb-4 pt-2">
            
              <button
                type="button"
                onClick={handleApplyFilters}
                className="h-12 flex-1 rounded-full bg-gradient-to-br from-[#6CACDF] to-[#0000FE] text-base font-semibold text-white"
              >
                OK
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="h-12 flex-1 rounded-full border border-gray-300 bg-white text-base font-semibold text-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

