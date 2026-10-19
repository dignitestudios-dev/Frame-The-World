"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PostMediaFile, isMediaItemVideo } from "@/lib/postMedia";
import { ChevronLeft, ChevronRight, Film, Image as ImageIcon } from "lucide-react";

interface PostMediaCarouselProps {
  mediaList: PostMediaFile[];
  caption?: string | null;
  className?: string;
  children?: React.ReactNode;
}

export default function PostMediaCarousel({
  mediaList,
  caption,
  className = "",
  children,
}: PostMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeList = mediaList.length > 0 ? mediaList : [];
  const currentItem = safeList[activeIndex] || safeList[0] || null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : safeList.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < safeList.length - 1 ? prev + 1 : 0));
  };

  if (!currentItem) {
    return (
      <div className={`relative bg-black flex items-center justify-center ${className}`}>
        {children}
        <p className="text-gray-400 text-sm font-medium">No media available</p>
      </div>
    );
  }

  const isVideo = isMediaItemVideo(currentItem);
  const mediaUrl = currentItem.location || currentItem.url || "/images/no data found.jpg";
  const posterUrl = currentItem.thumbnail?.location || currentItem.thumbnail?.url || undefined;

  return (
    <div className={`relative bg-black group select-none ${className}`}>
      {/* Media item render */}
      {isVideo ? (
        <video
          key={mediaUrl}
          src={mediaUrl}
          poster={posterUrl}
          controls
          playsInline
          className="w-full h-full object-contain"
        />
      ) : (
        <>
          <Image
            src={mediaUrl}
            alt={caption || "Post media"}
            fill
            priority
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
        </>
      )}

      {/* Embedded children (like Back button) */}
      {children}

      {/* Multi-item indicator badge & Type badge */}
      {safeList.length > 1 && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold shadow">
            {activeIndex + 1} / {safeList.length}
          </span>
          <span className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white shadow">
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
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
            {safeList.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-6 bg-white shadow-md"
                    : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
