"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Header from "@/components/global/header";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SaveModal from "@/components/global/SaveModal"; 
import { useAccessControl } from "@/providers/AccessControlProvider";
import { GridCardSkeleton } from "@/components/global/Skeletons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/apiError";
import { getFeaturedPostsApi, getFramesApi, getPostsApi } from "@/services/authApi";

const FEED_PAGE_LIMIT = 10;
const FALLBACK_IMAGE_URL =
  "https://t4.ftcdn.net/jpg/07/91/22/59/360_F_791225927_caRPPH99D6D1iFonkCRmCGzkJPf36QDw.jpg";
const FRAME_COVER_FALLBACK_URL = "https://static.vecteezy.com/system/resources/previews/009/007/126/non_2x/document-file-not-found-search-no-result-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg";

function isImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(url);
}

export default function TravelStoryPage() {
  const [activeTab, setActiveTab] = useState<"forYou" | "featured" | "frames">("forYou");
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isSaveOpen, setIsSaveOpen] = useState(false); // State to control modal visibility

  const isFrames = activeTab === "frames";
  const router = useRouter();
  const { executeWithCheck } = useAccessControl();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data: forYouPages,
    isLoading: isForYouLoading,
    isError: isForYouError,
    error: forYouError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["for-you-feed"],
    queryFn: ({ pageParam }) => getPostsApi({ page: pageParam, limit: FEED_PAGE_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: activeTab === "forYou",
  });

  const {
    data: featuredPages,
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
    error: featuredError,
    fetchNextPage: fetchFeaturedNextPage,
    hasNextPage: hasFeaturedNextPage,
    isFetchingNextPage: isFetchingFeaturedNextPage,
  } = useInfiniteQuery({
    queryKey: ["featured-feed"],
    queryFn: ({ pageParam }) =>
      getFeaturedPostsApi({ page: pageParam, limit: FEED_PAGE_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: activeTab === "featured",
  });

  const {
    data: framesPages,
    isLoading: isFramesLoading,
    isError: isFramesError,
    error: framesError,
    fetchNextPage: fetchFramesNextPage,
    hasNextPage: hasFramesNextPage,
    isFetchingNextPage: isFetchingFramesNextPage,
  } = useInfiniteQuery({
    queryKey: ["frames-feed"],
    queryFn: ({ pageParam }) => getFramesApi({ page: pageParam, limit: FEED_PAGE_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: activeTab === "frames",
  });

  const forYouPosts = useMemo(() => {
    if (!forYouPages?.pages) return [];
    return forYouPages.pages
      .flatMap((page) => page.data)
      .filter((post) => isImageUrl(post.media?.location));
  }, [forYouPages]);

  const featuredPosts = useMemo(() => {
    if (!featuredPages?.pages) return [];
    return featuredPages.pages
      .flatMap((page) => page.data)
      .filter((post) => isImageUrl(post.media?.location));
  }, [featuredPages]);

  const frameItems = useMemo(() => {
    if (!framesPages?.pages) return [];
    return framesPages.pages.flatMap((page) => page.data);
  }, [framesPages]);

  const isForYouTab = activeTab === "forYou";
  const isFeaturedTab = activeTab === "featured";
  const isFramesTab = activeTab === "frames";
  const isFeedTab = isForYouTab || isFeaturedTab || isFramesTab;

  const activePosts = isForYouTab ? forYouPosts : isFeaturedTab ? featuredPosts : [];
  const isTabLoading = isForYouTab
    ? isForYouLoading
    : isFeaturedTab
      ? isFeaturedLoading
      : isFramesLoading;
  const isTabError = isForYouTab ? isForYouError : isFeaturedTab ? isFeaturedError : isFramesError;
  const tabError = isForYouTab ? forYouError : isFeaturedTab ? featuredError : framesError;

  useEffect(() => {
    if (!isFeedTab) return;
    if (!loadMoreRef.current) return;

    const hasMore = isForYouTab ? hasNextPage : isFeaturedTab ? hasFeaturedNextPage : hasFramesNextPage;
    const isFetching = isForYouTab
      ? isFetchingNextPage
      : isFeaturedTab
        ? isFetchingFeaturedNextPage
        : isFetchingFramesNextPage;
    const fetchMore = isForYouTab
      ? fetchNextPage
      : isFeaturedTab
        ? fetchFeaturedNextPage
        : fetchFramesNextPage;

    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isFetching) {
          fetchMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [
    fetchFeaturedNextPage,
    fetchFramesNextPage,
    fetchNextPage,
    hasFeaturedNextPage,
    hasFramesNextPage,
    hasNextPage,
    isFeaturedTab,
    isFeedTab,
    isFetchingFramesNextPage,
    isFetchingFeaturedNextPage,
    isFetchingNextPage,
    isFramesTab,
    isForYouTab,
  ]);


const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };


  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      {/* Sticky Header */}
      <Header />

      <div className="px-6 py-4">

    <section
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="
        flex flex-nowrap gap-4 px-6 pb-4 mb-6
        overflow-x-auto
        cursor-grab active:cursor-grabbing
        overscroll-x-contain
        scroll-smooth
        snap-x snap-mandatory
        select-none
        [&::-webkit-scrollbar]:hidden
        [-ms-overflow-style:none]
        [scrollbar-width:none]
      "
    >
      {[25, 15, 25, 15, 20].map((item, i) => (
        <div
          key={i}
          className="
            shrink-0
            snap-start
            min-w-[343px] h-[120px]
            rounded-3xl
            bg-gray-900
            relative overflow-hidden
            shadow
          "
        >
          <Image
            src="/images/2.jpg"
            alt="Story"
            fill
            className="object-cover opacity-80"
          />

          {/* Card Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <span className="text-white text-2xl font-bold">
              {item}+
            </span>
            <span className="text-sm text-gray-200">
              Frame name here
            </span>
          </div>

          {/* Bottom Right Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              executeWithCheck(() => router.push("/framedetails"), { isPendingAllowed: false });
            }}
            className="
              absolute bottom-3 right-3
              bg-transparent backdrop-blur
              rounded-full
              w-9 h-9
              flex items-center justify-center
              shadow-lg
             hover:scale-110
              transition
              z-10
            "
          >
            <ArrowRight className="w-5 h-5 text-white font-bold" />
          </button>
        </div>
      ))}
    </section>


      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={() => setActiveTab("forYou")}
          className={`px-6 py-2 rounded-full font-medium shadow ${activeTab === "forYou"
              ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white"
              : "bg-gray-200 text-gray-600"
            }`}
        >
          For You
        </button>

        <button
          onClick={() => setActiveTab("featured")}
          className={`px-6 py-2 rounded-full font-medium shadow ${activeTab === "featured"
              ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white"
              : "bg-gray-200 text-gray-600"
            }`}
        >
          Featured
        </button>

        <button
          onClick={() => setActiveTab("frames")}
          className={`px-6 py-2 rounded-full font-medium shadow ${activeTab === "frames"
              ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white"
              : "bg-gray-200 text-gray-600"
            }`}
        >
          Frames
        </button>
      </div>

      {/* ====== FRAMES GRID (only when Frames clicked) ====== */}
      {isFrames && (
        <div className="max-w-[1400px] mx-auto">
          {isTabLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index}>
                  <GridCardSkeleton />
                </div>
              ))}
            </div>
          ) : isTabError ? (
            <div className="py-10 text-center text-red-600 font-medium">
              {getApiErrorMessage(tabError)}
            </div>
          ) : frameItems.length === 0 ? (
            <div className="min-h-[420px] flex flex-col items-center justify-center text-center">
              <div className="relative h-48 w-48 md:h-56 md:w-56">
                <Image src="/images/no data found.jpg" alt="No data found" fill className="object-contain" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">No data found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {frameItems.map((frame, i) => {
                  const coverUrl =
                    isImageUrl(frame.cover?.location) ? frame.cover?.location : FRAME_COVER_FALLBACK_URL;
                  return (
                    <div
                      key={frame._id}
                      onClick={() =>
                        executeWithCheck(() => router.push("/framedetails"), { isPendingAllowed: false })
                      }
                      className="relative overflow-hidden cursor-pointer rounded-[49.26px] shadow-[0_10px_25px_rgba(0,0,0,0.35)] w-[254px] h-[254px]"
                    >
                      <img
                        src={coverUrl}
                        alt={frame.title || "Frame"}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        onError={(event) => {
                          const target = event.currentTarget;
                          if (target.src !== FRAME_COVER_FALLBACK_URL) {
                            target.src = FRAME_COVER_FALLBACK_URL;
                          }
                        }}
                      />

                      <div className="absolute inset-6 rounded-[40px] border-4 border-black/40 overflow-hidden">
                        <img
                          src={coverUrl}
                          alt={`${frame.title || "Frame"} inner`}
                          className="absolute inset-0 h-full w-full object-cover opacity-90"
                          loading="lazy"
                          onError={(event) => {
                            const target = event.currentTarget;
                            if (target.src !== FRAME_COVER_FALLBACK_URL) {
                              target.src = FRAME_COVER_FALLBACK_URL;
                            }
                          }}
                        />
                      </div>

                      <div className="absolute inset-0 rounded-[49.26px] shadow-[inset_0_0_0_8px_rgba(0,0,0,0.35)]" />

                      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                        <div className="relative w-[170px] h-[170px] rounded-[30px] overflow-hidden border border-white/20">
                          <img
                            src={coverUrl}
                            alt={`${frame.title || "Frame"} preview`}
                            className="absolute inset-0 h-full w-full object-cover opacity-80"
                            loading="lazy"
                            onError={(event) => {
                              const target = event.currentTarget;
                              if (target.src !== FRAME_COVER_FALLBACK_URL) {
                                target.src = FRAME_COVER_FALLBACK_URL;
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="absolute inset-0 flex pt-34 flex-col items-center text-white bg-[#00000056]">
                        <div className="text-3xl font-bold">{frame.totalPosts}+</div>
                        <div className="text-sm mt-1 px-3 text-center">{frame.title || "Untitled Frame"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div ref={loadMoreRef} className="h-12" />

              {isFetchingFramesNextPage && (
                <div className="py-6 text-center text-sm font-medium text-gray-600">Loading more frames...</div>
              )}
            </>
          )}
        </div>
      )}


      {/* Masonry Grid (default for other tabs) */}
      {!isFrames && (
        <div className="max-w-[1400px] mx-auto">
          {isTabLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[120px] gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className={`${index % 5 === 0 || index % 7 === 0 ? "row-span-2" : "row-span-3"}`}
                >
                  <GridCardSkeleton />
                </div>
              ))}
            </div>
          ) : isTabError ? (
            <div className="py-10 text-center text-red-600 font-medium">
              {getApiErrorMessage(tabError)}
            </div>
          ) : isFeedTab && activePosts.length === 0 ? (
            <div className="min-h-[420px] flex flex-col items-center justify-center text-center">
              <div className="relative h-48 w-48 md:h-56 md:w-56">
                <Image src="/images/no data found.jpg" alt="No data found" fill className="object-contain" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">No data found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[120px] gap-6 cursor-pointer">
                {(isFeedTab ? activePosts : Array.from({ length: 20 }).map((_, i) => i)).map(
                  (item, i) => {
                    const isTall = i % 5 === 0 || i % 7 === 0;
                    const imageUrl =
                      isFeedTab
                        ? (item as { media?: { location?: string | null } }).media?.location ?? "/images/1.jpg"
                        : `/images/${(i % 4) + 1}.jpg`;

                    return (
                      <div
                        key={isFeedTab ? (item as { _id: string })._id : i}
                        onClick={() =>
                          executeWithCheck(() => router.push("/postdetails"), { isPendingAllowed: false })
                        }
                        className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl hover:shadow-2xl transition ${
                          isTall ? "row-span-2" : "row-span-3"
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt="Travel"
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
                  }
                )}
              </div>

              {isFeedTab && <div ref={loadMoreRef} className="h-12" />}

              {isFeedTab && (isForYouTab ? isFetchingNextPage : isFetchingFeaturedNextPage) && (
                <div className="py-6 text-center text-sm font-medium text-gray-600">Loading more posts...</div>
              )}
            </>
          )}
        </div>
      )}

      </div>
      <SaveModal
  isOpen={isSaveOpen} // Control modal visibility
  onClose={() => setIsSaveOpen(false)} // Close modal when clicking outside or pressing X
/>
    </div>
  );
}
