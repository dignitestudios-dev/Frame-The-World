"use client";

import Image from "next/image";
import React from "react";
import { Loader2 } from "lucide-react";

interface Post {
  id?: string;
  _id?: string;
  media?: {
    location?: string | null;
    type?: string | null;
    duration?: number | null;
    thumbnail?: { location?: string | null } | null;
  } | string;
  mediaType?: "image" | "video" | null;
  caption?: string;
  categories?: any[];
  status?: string;
  location?: string;
}

interface OwnPostCardProps {
  post: Post;
  isTall: boolean;
  onClick: () => void;
}

const statusStyles: Record<string, { bg: string; dot: string; text: string }> = {
  approved: {
    bg: "bg-emerald-500/80 border-emerald-300/40",
    dot: "bg-emerald-300",
    text: "text-white",
  },
  completed: {
    bg: "bg-emerald-500/80 border-emerald-300/40",
    dot: "bg-emerald-300",
    text: "text-white",
  },
  pending: {
    bg: "bg-amber-500/80 border-amber-300/40",
    dot: "bg-amber-300",
    text: "text-white",
  },
  rejected: {
    bg: "bg-red-500/80 border-red-300/40",
    dot: "bg-red-300",
    text: "text-white",
  },
  needs_human_removal: {
    bg: "bg-red-500/80 border-red-300/40",
    dot: "bg-red-300",
    text: "text-white",
  },
};

const OwnPostCard: React.FC<OwnPostCardProps> = ({ post, isTall, onClick }) => {
  const isVideo =
    post.mediaType === "video" ||
    (typeof post.media === "object" && post.media?.type === "video");

  const thumbnailLocation =
    typeof post.media === "object" ? post.media?.thumbnail?.location : null;
  const directLocation =
    typeof post.media === "string" ? post.media : post.media?.location;

  const displayUrl =
    thumbnailLocation || directLocation || "/images/placeholder.jpg";

  const statusKey = post.status?.toLowerCase() ?? "";
  const style = statusStyles[statusKey] ?? {
    bg: "bg-black/60 border-white/20",
    dot: "bg-white/60",
    text: "text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]
        ${isTall ? "row-span-3" : "row-span-2"}`}
    >
      <Image
        src={displayUrl}
        alt={post.caption || "Post"}
        fill
        className="object-cover cursor-pointer"
        onClick={onClick}
      />

      {/* Video Indicator */}
      {isVideo && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white shadow-md">
          <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      {/* Status Badge */}
      {post.status && post.status != "completed" && (
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 backdrop-blur-sm ${style.bg} ${style.text} text-[10px] font-bold uppercase tracking-wider rounded-full z-10 shadow-sm border`}
        >
          <span className="relative flex h-2 w-2">
            {statusKey === "pending" && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-75`} />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
          </span>
          {post.status == "needs_human_removal" ? "Rejected" : post.status}
        </div>
      )}
    </div>
  );
};

export default OwnPostCard;