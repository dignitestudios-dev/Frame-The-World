"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Header from "@/components/global/header";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SaveModal from "@/components/global/SaveModal";
import { GridCardSkeleton } from "@/components/global/Skeletons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/apiError";
import { getFeaturedPostsApi, getPostsApi } from "@/services/postApi";
import { getFramesApi } from "@/services/frameApi";
import { usePostStore } from "@/store/PostStore";

const FEED_PAGE_LIMIT = 10;
const FALLBACK_IMAGE_URL =
  "https://t4.ftcdn.net/jpg/07/91/22/59/360_F_791225927_caRPPH99D6D1iFonkCRmCGzkJPf36QDw.jpg";
const FRAME_COVER_FALLBACK_URL =
  "https://static.vecteezy.com/system/resources/previews/009/007/126/non_2x/document-file-not-found-search-no-result-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg";

function isImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(url);
}

const SliderFrameCard = React.memo(function SliderFrameCard({
  frame,
  index = 0,
  onClick,
}: {
  frame: any;
  index?: number;
  onClick: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const coverUrl = isImageUrl(frame.cover?.location)
    ? frame.cover.location
    : FRAME_COVER_FALLBACK_URL;
  const [imgSrc, setImgSrc] = useState(coverUrl);

  useEffect(() => {
    setImgSrc(
      isImageUrl(frame.cover?.location)
        ? frame.cover.location
        : FRAME_COVER_FALLBACK_URL
    );
    setIsLoaded(false);
  }, [frame.cover?.location]);

  return (
    <div
      onClick={onClick}
      className="shrink-0 snap-start min-w-[343px] h-[120px] rounded-3xl bg-gray-900 relative overflow-hidden cursor-pointer shadow transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99] contain-paint transform-gpu"
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse z-0" />
      )}
      <Image
        src={imgSrc}
        alt={frame.title || "Frame"}
        fill
        sizes="343px"
        priority={index < 2}
        loading={index < 2 ? "eager" : "lazy"}
        decoding="async"
        className={`object-cover transition-all duration-700 ease-out will-change-[filter,opacity,transform] ${
          isLoaded
            ? "opacity-80 blur-0 scale-100"
            : "opacity-0 blur-lg scale-105"
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imgSrc !== FRAME_COVER_FALLBACK_URL) {
            setImgSrc(FRAME_COVER_FALLBACK_URL);
          }
        }}
      />

      {/* Card Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 pointer-events-none">
        <span className="text-white text-2xl font-bold drop-shadow-md">
          {frame.totalPosts > 99 ? `${frame.totalPosts}+` : frame.totalPosts}
        </span>
        <span className="text-sm text-gray-200 font-medium drop-shadow-sm truncate max-w-[240px]">
          {frame.title || "Untitled Frame"}
        </span>
      </div>

      {/* Bottom Right Button */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        className="absolute bottom-3 right-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition z-10"
      >
        <ArrowRight className="w-5 h-5 text-white font-bold" />
      </button>
    </div>
  );
});

const FrameGridCard = React.memo(function FrameGridCard({
  frame,
  index = 0,
  onClick,
}: {
  frame: any;
  index?: number;
  onClick: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const coverUrl = isImageUrl(frame.cover?.location)
    ? frame.cover.location
    : FRAME_COVER_FALLBACK_URL;
  const [imgSrc, setImgSrc] = useState(coverUrl);

  useEffect(() => {
    setImgSrc(
      isImageUrl(frame.cover?.location)
        ? frame.cover.location
        : FRAME_COVER_FALLBACK_URL
    );
    setIsLoaded(false);
  }, [frame.cover?.location]);

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden cursor-pointer rounded-[49.26px] shadow-[0_10px_25px_rgba(0,0,0,0.35)] w-[254px] h-[254px] bg-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] contain-paint transform-gpu"
      style={{ contentVisibility: "auto", containIntrinsicSize: "254px 254px" }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse z-0" />
      )}
      {/* Background Outer Frame Image */}
      <Image
        src={imgSrc}
        alt={frame.title || "Frame"}
        fill
        sizes="254px"
        priority={index < 4}
        loading={index < 4 ? "eager" : "lazy"}
        decoding="async"
        className={`object-cover transition-all duration-700 ease-out will-change-[filter,opacity,transform] ${
          isLoaded
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-lg scale-105"
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imgSrc !== FRAME_COVER_FALLBACK_URL) {
            setImgSrc(FRAME_COVER_FALLBACK_URL);
          }
        }}
      />

      {/* Middle Frame Layer */}
      <div className="absolute inset-6 rounded-[40px] border-4 border-black/40 overflow-hidden pointer-events-none">
        <Image
          src={imgSrc}
          alt={`${frame.title || "Frame"} inner`}
          fill
          sizes="206px"
          loading="lazy"
          decoding="async"
          className={`object-cover transition-all duration-700 ease-out will-change-[filter,opacity,transform] ${
            isLoaded
              ? "opacity-90 blur-0 scale-100"
              : "opacity-0 blur-lg scale-105"
          }`}
          onError={() => {
            if (imgSrc !== FRAME_COVER_FALLBACK_URL) {
              setImgSrc(FRAME_COVER_FALLBACK_URL);
            }
          }}
        />
      </div>

      <div className="absolute inset-0 rounded-[49.26px] shadow-[inset_0_0_0_8px_rgba(0,0,0,0.35)] pointer-events-none" />

      {/* Center Frame Layer */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="relative w-[170px] h-[170px] rounded-[30px] overflow-hidden border border-white/20">
          <Image
            src={imgSrc}
            fill
            sizes="170px"
            loading="lazy"
            decoding="async"
            alt={`${frame.title || "Frame"} preview`}
            className={`object-cover transition-all duration-700 ease-out will-change-[filter,opacity,transform] ${
              isLoaded
                ? "opacity-80 blur-0 scale-100"
                : "opacity-0 blur-lg scale-105"
            }`}
            onError={() => {
              if (imgSrc !== FRAME_COVER_FALLBACK_URL) {
                setImgSrc(FRAME_COVER_FALLBACK_URL);
              }
            }}
          />
        </div>
      </div>

      {/* Frame Text Info */}
      <div className="absolute inset-0 flex pt-34 flex-col items-center text-white bg-[#00000056] pointer-events-none z-10">
        <div className="text-3xl font-bold drop-shadow-md">
          {frame.totalPosts > 99 ? `${frame.totalPosts}+` : frame.totalPosts}
        </div>
        <div className="text-sm mt-1 px-3 text-center capitalize drop-shadow-sm font-medium truncate max-w-[200px]">
          {frame.title || "Untitled Frame"}
        </div>
      </div>
    </div>
  );
});

function FeedLoadingIndicator({ label = "Loading more posts..." }: { label?: string }) {
  return (
    <div className="py-8 flex justify-center items-center">
      <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/90 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,254,0.08)] border border-blue-50 transition-all transform-gpu hover:scale-105">
        <div className="relative flex items-center justify-center w-5 h-5">
          <div className="w-5 h-5 rounded-full border-2 border-blue-100 border-t-[#0000FE] border-r-[#6CACDF] animate-spin" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6CACDF] to-[#0000FE]" />
        </div>
        <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-[#6CACDF] to-[#0000FE] bg-clip-text text-transparent">
          {label}
        </span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6CACDF] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#3668f5] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#0000FE] animate-bounce" />
        </div>
      </div>
    </div>
  );
}

const PostGridCard = React.memo(function PostGridCard({
  item,
  index,
  onClick,
}: {
  item: any;
  index: number;
  onClick: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isTall = index % 5 === 0 || index % 7 === 0;
  const imageUrl = item?.media?.location || "/images/1.jpg";
  const [imgSrc, setImgSrc] = useState(imageUrl);

  useEffect(() => {
    setImgSrc(item?.media?.location || "/images/1.jpg");
    setIsLoaded(false);
  }, [item?.media?.location]);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-[28px] bg-gray-100 shadow-xl hover:shadow-2xl transition duration-300 transform-gpu hover:scale-[1.01] contain-paint ${
        isTall ? "row-span-2" : "row-span-3"
      }`}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: isTall ? "240px" : "360px",
      }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse z-0" />
      )}
      <Image
        fill
        src={imgSrc}
        alt="Travel"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        priority={index < 4}
        loading={index < 4 ? "eager" : "lazy"}
        decoding="async"
        className={`object-cover transition-all duration-700 ease-out will-change-[filter,opacity,transform] ${
          isLoaded
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-lg scale-105"
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imgSrc !== FALLBACK_IMAGE_URL) {
            setImgSrc(FALLBACK_IMAGE_URL);
          }
        }}
      />
    </div>
  );
});

export default function TravelStoryPage() {
  const [activeTab, setActiveTab] = useState<"forYou" | "featured" | "frames">("forYou");
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isSaveOpen, setIsSaveOpen] = useState(false);

  const isFrames = activeTab === "frames";
  const router = useRouter();
  const { setPostDetails } = usePostStore();
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
    enabled: true,
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

  const topFrameItems = useMemo(() => {
    return [...frameItems].sort((a, b) => (b.totalPosts ?? 0) - (a.totalPosts ?? 0));
  }, [frameItems]);

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
    const isInitialLoading = isForYouTab
      ? isForYouLoading
      : isFeaturedTab
        ? isFeaturedLoading
        : isFramesLoading;
    const fetchMore = isForYouTab
      ? fetchNextPage
      : isFeaturedTab
        ? fetchFeaturedNextPage
        : fetchFramesNextPage;

    if (!hasMore || isInitialLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isFetching) {
          fetchMore();
        }
      },
      { rootMargin: "300px" }
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
    isFeaturedLoading,
    isFeaturedTab,
    isFeedTab,
    isFetchingFramesNextPage,
    isFetchingFeaturedNextPage,
    isFetchingNextPage,
    isForYouLoading,
    isForYouTab,
    isFramesLoading,
    isFramesTab,
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
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <Header
        title="Today’s Travel Story"
        subtitle={`${activePosts?.length || frameItems?.length}+ new memories for you`}
      />

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
          {isFramesLoading && topFrameItems.length === 0
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`frame-slider-skeleton-${index}`}
                  className="
                    shrink-0
                    snap-start
                    min-w-[343px] h-[120px]
                    rounded-3xl
                    bg-gray-200
                    animate-pulse
                    relative overflow-hidden
                    shadow
                  "
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div className="h-7 w-16 rounded-md bg-gray-300/90" />
                    <div className="h-4 w-36 rounded-md bg-gray-300/90" />
                  </div>
                </div>
              ))
            : topFrameItems.length === 0
              ? (
                <div className="min-w-full h-[120px] rounded-3xl bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                  No frame found
                </div>
              )
              : topFrameItems.slice(0, 5).map((frame, index) => (
                  <SliderFrameCard
                    key={frame._id || index}
                    frame={frame}
                    index={index}
                    onClick={() => router.push(`/frame-detail/${frame._id}`)}
                  />
                ))}
        </section>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab("forYou")}
            className={`px-6 py-2 rounded-full font-medium shadow transition-all duration-200 ${
              activeTab === "forYou"
                ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            For You
          </button>

          <button
            onClick={() => setActiveTab("featured")}
            className={`px-6 py-2 rounded-full font-medium shadow transition-all duration-200 ${
              activeTab === "featured"
                ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Featured
          </button>

          <button
            onClick={() => setActiveTab("frames")}
            className={`px-6 py-2 rounded-full font-medium shadow transition-all duration-200 ${
              activeTab === "frames"
                ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
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
                  <Image src="/images/no-found.png" alt="No data found" fill className="object-contain" />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {frameItems.map((frame, i) => (
                    <FrameGridCard
                      key={frame._id || i}
                      frame={frame}
                      index={i}
                      onClick={() => router.push(`/frame-detail/${frame._id}`)}
                    />
                  ))}
                </div>

                <div ref={loadMoreRef} className="h-12" />

                {isFetchingFramesNextPage && (
                  <FeedLoadingIndicator label="Discovering more frames" />
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
                  <Image src="/images/no-found.png" alt="No data found" fill className="object-contain" />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[120px] gap-6 cursor-pointer">
                  {(isFeedTab ? activePosts : Array.from({ length: 20 }).map((_, i) => i)).map(
                    (item, i) => {
                      const post = item as any;
                      const postId = post?._id || post?.id;

                      return (
                        <PostGridCard
                          key={isFeedTab ? postId : i}
                          item={item}
                          index={i}
                          onClick={() => {
                            if (post) {
                              setPostDetails(post);
                              router.push(`/postdetails?id=${postId}`);
                            }
                          }}
                        />
                      );
                    }
                  )}
                </div>

                {isFeedTab && <div ref={loadMoreRef} className="h-12" />}

                {isFeedTab && (isForYouTab ? isFetchingNextPage : isFetchingFeaturedNextPage) && (
                  <FeedLoadingIndicator label="Loading more memories" />
                )}
              </>
            )}
          </div>
        )}
      </div>
      <SaveModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
      />
    </div>
  );
}
