"use client";

import Image from "next/image";
import { EllipsisVertical } from "lucide-react";
import React, { useState } from "react";
import PostOptionsMenu from "./PostOptionsMenu";

interface Post {
  id?: string;
  _id?: string;
  media?: { location: string } | string;
  caption?: string;
  categories?: any[];
  status?: string;
  location?: string;
}

interface OwnPostCardProps {
  post: Post;
  isTall: boolean;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onClick: () => void;
}

const OwnPostCard: React.FC<OwnPostCardProps> = ({
  post,
  isTall,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const postId = post.id || post._id || "";
  const imageUrl =
    typeof post.media === "string"
      ? post.media
      : post.media?.location || "/images/placeholder.jpg";

  const isCompleted = post.status?.toLowerCase() === "completed";
  const showButton = (isHovered || isMenuOpen) && isCompleted;

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]
          ${isTall ? "row-span-3" : "row-span-2"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={imageUrl}
          alt={post.caption || "Post"}
          fill
          className="object-cover cursor-pointer"
          onClick={onClick}
        />

        {/* Status Badge */}
        {post.status && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full z-10 shadow-sm border border-white/20">
            {post.status}
          </div>
        )}

        {/* Options Button — visible on hover OR when menu is open, ONLY if completed */}
        <div
          className={`absolute top-3 right-3 transition-opacity duration-200 ${
            showButton ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsMenuOpen(true);
            }}
            className="h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white transition-colors"
          >
            <EllipsisVertical className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Portal-like: rendered OUTSIDE the card div to avoid event/hover conflicts */}
      <PostOptionsMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onEdit={() => {
          setIsMenuOpen(false);
          onEdit(post);
        }}
        onDelete={() => {
          setIsMenuOpen(false);
          onDelete(postId);
        }}
      />
    </>
  );
};

export default OwnPostCard;
