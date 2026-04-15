"use client";

import Image from "next/image";
import { Bookmark, EllipsisVertical, MapPin, PlusIcon } from "lucide-react";
import Header from "@/components/global/header";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState, useEffect } from "react";
import SaveModal from "@/components/global/SaveModal";
import { useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/apiError";
import { getFrameByIdApi, getFramePostsApi } from "@/services/authApi";
import { GridCardSkeleton } from "@/components/global/Skeletons";

const FALLBACK_IMAGE_URL =
  "https://t4.ftcdn.net/jpg/07/91/22/59/360_F_791225927_caRPPH99D6D1iFonkCRmCGzkJPf36QDw.jpg";

function isImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(url);
}

export default function FrameDetailsPage() {
  const router = useRouter();
  const params = useParams<{ frameId: string }>();
  const frameId = params?.frameId;

  const [open, setOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["frame-details", frameId],
    queryFn: () => getFrameByIdApi(frameId),
    enabled: Boolean(frameId),
  });

  const {
    data: framePostsData,
    isLoading: isFramePostsLoading,
    isError: isFramePostsError,
    error: framePostsError,
  } = useQuery({
    queryKey: ["frame-posts", frameId],
    queryFn: () => getFramePostsApi(frameId, { page: 1, limit: 20 }),
    enabled: Boolean(frameId),
  });

  const frame = data?.data;
  const framePosts = useMemo(() => {
    return (framePostsData?.data ?? []).filter((post) => isImageUrl(post.media?.location));
  }, [framePostsData?.data]);

  const locationTitle = useMemo(() => {
    return frame?.city || frame?.state || frame?.country || "Location not available";
  }, [frame?.city, frame?.country, frame?.state]);

  const locationSubtitle = useMemo(() => {
    const parts = [frame?.city, frame?.state, frame?.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not available";
  }, [frame?.city, frame?.country, frame?.state]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      <Header />

      <SaveModal isOpen={isSaveOpen} onClose={() => setIsSaveOpen(false)} />

      <div className="px-6 py-2">
        <h1 className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="flex flex-col">
                {isLoading ? (
                  <>
                    <span className="font-semibold text-blue-600">Loading...</span>
                    <span className="text-sm text-black">Fetching location</span>
                  </>
                ) : isError ? (
                  <>
                    <span className="font-semibold text-blue-600">Error</span>
                    <span className="text-sm text-black">{getApiErrorMessage(error)}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-blue-600">{locationTitle}</span>
                    <span className="text-sm text-black">{locationSubtitle}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <PlusIcon className="text-blue-500 " />
            </div>
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition"
              >
                <EllipsisVertical className="text-blue-500" size={20} />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <button
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    Delete Frame
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    Make Frame Private
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 transition"
                  >
                    Rename Frame
                  </button>
                </div>
              )}
            </div>
          </div>
        </h1>

        <div className="max-w-[1400px] mx-auto">
          {isFramePostsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 auto-rows-[120px] gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`${i % 5 === 0 || i % 7 === 0 ? "row-span-2" : "row-span-3"}`}
                >
                  <GridCardSkeleton />
                </div>
              ))}
            </div>
          ) : isFramePostsError ? (
            <div className="py-10 text-center text-red-600 font-medium">
              {getApiErrorMessage(framePostsError)}
            </div>
          ) : framePosts.length === 0 ? (
            <div className="min-h-[420px] flex flex-col items-center justify-center text-center">
              <div className="relative h-48 w-48 md:h-56 md:w-56">
                <Image src="/images/no data found.jpg" alt="No data found" fill className="object-contain" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">No data found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 auto-rows-[120px] gap-6">
              {framePosts.map((post, i) => {
                const isTall = i % 5 === 0 || i % 7 === 0;
                const imageUrl = post.media?.location ?? FALLBACK_IMAGE_URL;

                return (
                  <div
                    key={post._id}
                    className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl hover:shadow-2xl transition ${
                      isTall ? "row-span-2 " : "row-span-3"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={post.caption || "Frame post"}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        const target = event.currentTarget;
                        if (target.src !== FALLBACK_IMAGE_URL) {
                          target.src = FALLBACK_IMAGE_URL;
                        }
                      }}
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSaveOpen(true);
                      }}
                      className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow"
                    >
                      <Bookmark className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
