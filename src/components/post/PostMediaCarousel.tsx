"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { PostMediaFile, isMediaItemVideo } from "@/lib/postMedia";
import { ChevronLeft, ChevronRight, Film, Image as ImageIcon, Layers, Loader2, Maximize2, X } from "lucide-react";

interface PostMediaCarouselProps {
  mediaList: PostMediaFile[];
  caption?: string | null;
  className?: string;
  fitMode?: "cover" | "contain";
  children?: React.ReactNode;
}

export default function PostMediaCarousel({
  mediaList,
  caption,
  className = "",
  fitMode = "cover",
  children,
}: PostMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedMedia, setLoadedMedia] = useState<Record<string, boolean>>({});
  const [failedMedia, setFailedMedia] = useState<Record<string, boolean>>({});
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeList = mediaList.length > 0 ? mediaList : [];
  const currentItem = safeList[activeIndex] || safeList[0] || null;

  const imageCount = safeList.filter((m) => !isMediaItemVideo(m)).length;
  const videoCount = safeList.filter((m) => isMediaItemVideo(m)).length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : safeList.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < safeList.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (isZoomOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomOpen(false);
      } else if (isZoomOpen && safeList.length > 1) {
        if (e.key === "ArrowLeft") {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : safeList.length - 1));
        } else if (e.key === "ArrowRight") {
          setActiveIndex((prev) => (prev < safeList.length - 1 ? prev + 1 : 0));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomOpen, safeList.length]);

  if (!currentItem) {
    return (
      <div className={`relative bg-black flex items-center justify-center ${className}`}>
        {children}
        <p className="text-gray-400 text-sm font-medium">No media available</p>
      </div>
    );
  }

  const isVideo = isMediaItemVideo(currentItem);
  const mediaKey = currentItem._id || currentItem.id || currentItem.location || currentItem.url || `media-${activeIndex}`;
  const mediaUrl = failedMedia[mediaKey]
    ? "/images/no data found.jpg"
    : (currentItem.location || currentItem.url || "/images/no data found.jpg");
  const posterUrl = currentItem.thumbnail?.location || currentItem.thumbnail?.url || undefined;
  const isCurrentLoaded = Boolean(loadedMedia[mediaKey]);

  return (
    <>
      <div className={`relative bg-black group select-none ${className}`}>
        {/* Loading Spinner */}
        {!isCurrentLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none bg-black/40 backdrop-blur-[2px]">
            <Loader2 className="w-10 h-10 text-white animate-spin drop-shadow-md" />
            <span className="text-xs text-white/80 mt-2 font-medium">Loading media...</span>
          </div>
        )}

        {/* Media item render */}
        {isVideo ? (
          <video
            key={mediaUrl}
            src={mediaUrl}
            poster={posterUrl}
            controls
            playsInline
            onLoadedData={() => setLoadedMedia((prev) => ({ ...prev, [mediaKey]: true }))}
            onError={() => {
              setLoadedMedia((prev) => ({ ...prev, [mediaKey]: true }));
              setFailedMedia((prev) => ({ ...prev, [mediaKey]: true }));
            }}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              isCurrentLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div
            onClick={() => setIsZoomOpen(true)}
            className="w-full h-full relative cursor-zoom-in group/img"
            title="Click to zoom in"
          >
            <Image
              key={mediaUrl}
              src={mediaUrl}
              alt={caption || "Post media"}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={() => setLoadedMedia((prev) => ({ ...prev, [mediaKey]: true }))}
              onError={() => {
                setLoadedMedia((prev) => ({ ...prev, [mediaKey]: true }));
                setFailedMedia((prev) => ({ ...prev, [mediaKey]: true }));
              }}
              className={`w-full h-full transition-all duration-300 ${
                fitMode === "cover" ? "object-cover" : "object-contain"
              } ${isCurrentLoaded ? "opacity-100" : "opacity-0"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

            {/* Subtle Zoom Hint Button */}
            <div className="absolute bottom-5 right-5 z-10 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition shadow-lg pointer-events-none">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Embedded children (like Back button) */}
        {children}

        {/* Multi-item indicator badge & Type badge */}
        {safeList.length > 1 ? (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-semibold shadow">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {activeIndex + 1} / {safeList.length}
              </span>
              <span className="text-white/80 font-normal text-[11px] ml-0.5">
                ({imageCount > 0 && `${imageCount} ${imageCount === 1 ? "img" : "imgs"}`}
                {imageCount > 0 && videoCount > 0 && ", "}
                {videoCount > 0 && `${videoCount} ${videoCount === 1 ? "video" : "videos"}`})
              </span>
            </div>
            <span
              className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white shadow"
              title={isVideo ? "Video" : "Photo"}
            >
              {isVideo ? (
                <Film className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              )}
            </span>
          </div>
        ) : (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
            <span
              className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white shadow"
              title={isVideo ? "Video" : "Photo"}
            >
              {isVideo ? (
                <Film className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              )}
            </span>
          </div>
        )}

        {/* Navigation Arrows */}
        {safeList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-10">
              {safeList.map((item, idx) => {
                const isItemVid = isMediaItemVideo(item);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(idx);
                    }}
                    title={isItemVid ? `Video ${idx + 1}` : `Image ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 shadow-md ${
                      idx === activeIndex
                        ? "w-7 bg-white"
                        : "w-2.5 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to item ${idx + 1}`}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Lightbox / Zoom Popup Modal (Rendered via createPortal above all elements) */}
      {isZoomOpen && isMounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 overflow-hidden select-none animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomOpen(false);
            }}
            className="absolute top-5 right-5 z-30 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center shadow-lg transition backdrop-blur-md cursor-pointer"
            aria-label="Close zoom popup"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Top Info Bar */}
          <div
            className="absolute top-5 left-5 z-30 flex items-center gap-3 text-white pointer-events-none"
          >
            {safeList.length > 1 && (
              <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold shadow">
                {activeIndex + 1} / {safeList.length}
              </span>
            )}
            {caption && (
              <span className="text-sm text-white/90 max-w-xs sm:max-w-md md:max-w-xl truncate font-medium drop-shadow">
                {caption}
              </span>
            )}
          </div>

          {/* Perfectly Centered Media Container */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[82vh] flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Loading Spinner */}
            {!isCurrentLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <Loader2 className="w-12 h-12 text-white animate-spin drop-shadow-lg" />
                <span className="text-sm text-white/90 mt-3 font-medium drop-shadow">Loading image...</span>
              </div>
            )}

            {isVideo ? (
              <video
                key={`modal-${mediaUrl}`}
                src={mediaUrl}
                poster={posterUrl}
                controls
                autoPlay
                playsInline
                onLoadedData={() => setLoadedMedia((prev) => ({ ...prev, [mediaKey]: true }))}
                onError={() => {
                  setLoadedMedia((prev) => ({ ...prev, [mediaKey]: true }));
                  setFailedMedia((prev) => ({ ...prev, [mediaKey]: true }));
                }}
                className={`max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl transition-opacity duration-300 ${
                  isCurrentLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  key={`modal-${mediaUrl}`}
                  src={mediaUrl}
                  alt={caption || "Zoomed media"}
                  fill
                  sizes="100vw"
                  className={`object-contain transition-opacity duration-300 ${
                    isCurrentLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  priority
                  onLoad={() => setLoadedMedia((prev) => ({ ...prev, [mediaKey]: true }))}
                  onError={() => {
                    setLoadedMedia((prev) => ({ ...prev, [mediaKey]: true }));
                    setFailedMedia((prev) => ({ ...prev, [mediaKey]: true }));
                  }}
                />
              </div>
            )}
          </div>

          {/* Modal Navigation Arrows */}
          {safeList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition z-30 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition z-30 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              {/* Bottom Dots Indicator */}
              <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-2 z-30 pointer-events-auto">
                {safeList.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 shadow-md cursor-pointer ${
                      idx === activeIndex
                        ? "w-6 bg-white"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Go to item ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
