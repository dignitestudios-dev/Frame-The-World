"use client";

import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/global/header";
import { getSearchFramesApi, getSearchPostsApi } from "@/services/authApi";

type SearchTab = "all" | "images" | "frames";

const FALLBACK_IMAGE_URL =
  "https://t4.ftcdn.net/jpg/07/91/22/59/360_F_791225927_caRPPH99D6D1iFonkCRmCGzkJPf36QDw.jpg";
const FRAME_COVER_FALLBACK_URL =
  "https://static.vecteezy.com/system/resources/previews/009/007/126/non_2x/document-file-not-found-search-no-result-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg";

type ImageResultItem = {
  id: string;
  title: string;
  image: string;
};

type FrameResultItem = {
  id: string;
  title: string;
  totalPosts: number;
  image: string;
};

const isImageUrl = (url: string | null | undefined): url is string => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp|svg|jfif)$/i.test(url);
};

function SearchResultsContent() {
  const router = useRouter();
  const queryParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SearchTab>("all");

  const latitudeParam = queryParams.get("latitude");
  const longitudeParam = queryParams.get("longitude");
  const categories = queryParams.getAll("categories");

  const latitude = latitudeParam ? Number(latitudeParam) : undefined;
  const longitude = longitudeParam ? Number(longitudeParam) : undefined;
  const hasLatitude = typeof latitude === "number" && Number.isFinite(latitude);
  const hasLongitude = typeof longitude === "number" && Number.isFinite(longitude);
  const sanitizedCategories = categories.filter((item) => item.trim().length > 0);
  const hasCategories = sanitizedCategories.length > 0;
  const hasLocationFilters = hasLatitude && hasLongitude;
  const shouldFetchFilteredResults = hasLocationFilters || hasCategories;

  const {
    data: postsResponse,
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useQuery({
    queryKey: ["search-posts", latitudeParam, longitudeParam, categories.join(",")],
    queryFn: () =>
      getSearchPostsApi({
        limit: 40,
        latitude: hasLocationFilters ? latitude : undefined,
        longitude: hasLocationFilters ? longitude : undefined,
        categories: hasCategories ? sanitizedCategories : undefined,
      }),
    enabled: shouldFetchFilteredResults,
  });

  const {
    data: framesResponse,
    isLoading: isFramesLoading,
    isError: isFramesError,
  } = useQuery({
    queryKey: ["search-frames", latitudeParam, longitudeParam, categories.join(",")],
    queryFn: () =>
      getSearchFramesApi({
        latitude: hasLocationFilters ? latitude : undefined,
        longitude: hasLocationFilters ? longitude : undefined,
        categories: hasCategories ? sanitizedCategories : undefined,
      }),
    enabled: shouldFetchFilteredResults,
  });

  const imageItems: ImageResultItem[] = useMemo(() => {
    if (!Array.isArray(postsResponse?.data)) return [];
    return postsResponse.data
      .map((post) => ({
        id: post._id,
        title: "Image",
        image: isImageUrl(post.media?.location) ? post.media?.location : FALLBACK_IMAGE_URL,
      }))
      .filter((item) => !!item.id);
  }, [postsResponse]);

  const frameItems: FrameResultItem[] = useMemo(() => {
    if (!Array.isArray(framesResponse?.data)) return [];
    return framesResponse.data.map((frame) => ({
      id: frame._id,
      title: frame.title || "Untitled Frame",
      totalPosts: frame.totalPosts ?? 0,
      image: isImageUrl(frame.cover?.location) ? frame.cover?.location : FRAME_COVER_FALLBACK_URL,
    }));
  }, [framesResponse]);

  const filteredItems = useMemo<(ImageResultItem | FrameResultItem)[]>(() => {
    if (activeTab === "all") return [];
    return activeTab === "frames" ? frameItems : imageItems;
  }, [activeTab, frameItems, imageItems]);

  const renderImageGrid = (items: ImageResultItem[]) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item, index) => {
        const isSmall = index % 5 === 0 || index % 7 === 0;
        return (
          <div
            key={item.id}
            className={`relative overflow-hidden rounded-[28px] shadow-[0_8px_24px_rgba(0,0,0,0.28)] ${isSmall ? "aspect-square" : "aspect-[3/4]"
              }`}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        );
      })}
    </div>
  );

  const renderFrameGrid = (items: FrameResultItem[]) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => router.push(`/frame-detail/${item.id}`)}
          className="relative overflow-hidden cursor-pointer rounded-[49.26px] shadow-[0_10px_25px_rgba(0,0,0,0.35)] aspect-square"
        >
          <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />

          <div className="absolute inset-6 rounded-[40px] border-4 border-black/40 overflow-hidden">
            <img
              src={item.image}
              alt={`${item.title} inner`}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              loading="lazy"
            />
          </div>

          <div className="absolute inset-0 rounded-[49.26px] shadow-[inset_0_0_0_8px_rgba(0,0,0,0.35)]" />

          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className="relative w-[70%] h-[70%] rounded-[30px] overflow-hidden border border-white/20">
              <img
                src={item.image}
                alt={`${item.title} preview`}
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                loading="lazy"
              />
            </div>
          </div>

          <div className="absolute inset-0 flex pt-[56%] flex-col items-center text-white bg-[#00000056]">
            <div className="text-2xl font-bold">{item.totalPosts}+</div>
            <div className="text-xs mt-1 px-3 text-center">{item.title}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      <main className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-[3em] md:px-8">
        <div className="relative mb-6 flex items-center justify-center">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
          >
            <ChevronLeft className="h-6 w-6 text-black" />
          </button>
          <h1 className="text-3xl font-bold text-black">Search Result</h1>
        </div>

        <div className="mb-6 flex items-center justify-start gap-3">
          {(["all", "images", "frames"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-7 py-3 text-base capitalize transition ${activeTab === tab
                ? "bg-gradient-to-br from-[#6CACDF] to-[#0000FE] font-semibold text-white"
                : "bg-black/20 text-white"
                }`}
            >
              {tab}
            </button>
          ))}


        </div>

        <div className={activeTab === "all" ? "space-y-8" : "h-[68vh] overflow-y-auto pr-1"}>
          {!shouldFetchFilteredResults && (
            <div className="py-6 text-center font-medium text-gray-600">
              Please select location or categories to see filtered results.
            </div>
          )}



          {shouldFetchFilteredResults && activeTab === "all" ? (
            <div className="space-y-8">
              <section className="rounded-2xl bg-white/50 p-6">
                <div className="flex justify-between items-center pb-[1em]">
                  <h2 className="mb-4 text-[1.4em] font-bold text-black">Images</h2>
                  <button className="text-blue-600 font-bold">See All</button>
                </div>
                <div className="h-[70vh] overflow-y-auto pr-1">
                  {isPostsLoading ? (
                    <p className="text-sm text-gray-600">Loading images...</p>
                  ) : imageItems.length === 0 ? (
                    <p className="text-sm text-gray-600">No images found</p>
                  ) : (
                    renderImageGrid(imageItems)
                  )}
                </div>
              </section>

              <section className="rounded-2xl bg-white/50 p-6">
                <div className="flex justify-between items-center pb-[1em]">
                  <h2 className="mb-4 text-[1.4em] font-bold text-black">Frames</h2>
                  <button className="text-blue-600 font-bold">See All</button>
                </div>
                <div className="h-[70vh] overflow-y-auto pr-1">
                  {isFramesLoading ? (
                    <p className="text-sm text-gray-600">Loading frames...</p>
                  ) : frameItems.length === 0 ? (
                    <p className="text-sm text-gray-600">No frames found</p>
                  ) : (
                    renderFrameGrid(frameItems)
                  )}
                </div>
              </section>
            </div>
          ) : shouldFetchFilteredResults ? (
            <>
              {activeTab === "frames" ? (
                isFramesLoading ? (
                  <p className="text-sm text-gray-600">Loading frames...</p>
                ) : frameItems.length === 0 ? (
                  <p className="text-sm text-gray-600">No frames found</p>
                ) : (
                  renderFrameGrid(filteredItems as FrameResultItem[])
                )
              ) : isPostsLoading ? (
                <p className="text-sm text-gray-600">Loading images...</p>
              ) : imageItems.length === 0 ? (
                <p className="text-sm text-gray-600">No images found</p>
              ) : (
                renderImageGrid(filteredItems as ImageResultItem[])
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
