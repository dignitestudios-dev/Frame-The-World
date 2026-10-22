"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X, Images, Layers, ArrowRight, Sparkles } from "lucide-react";

interface CreatePostTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostTypeModal({
  isOpen,
  onClose,
}: CreatePostTypeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSelect = (mode: "single" | "multiple") => {
    onClose();
    router.push(`/Createdpost?mode=${mode}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
            Create New Post
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            Choose whether to publish a single story with multiple media or batch
            create multiple separate posts at once.
          </p>
        </div>

        {/* Option Cards */}
        <div className="flex flex-col gap-3.5">
          {/* Option 1: Single Post */}
          <button
            type="button"
            onClick={() => handleSelect("single")}
            className="group relative flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left shadow-sm hover:shadow-md active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Images className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Single Post
                </h3>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">
                Share one travel memory with up to 10 photos or videos in a
                single post gallery.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100/70 text-blue-700">
                  Up to 10 photos & videos
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                  1 Story
                </span>
              </div>
            </div>
          </button>

          {/* Option 2: Multiple Posts (Batch) */}
          <button
            type="button"
            onClick={() => handleSelect("multiple")}
            className="group relative flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-100 bg-white hover:border-purple-500 hover:bg-purple-50/40 transition-all text-left shadow-sm hover:shadow-md active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Multiple Posts (Batch)
                </h3>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">
                Draft and publish multiple independent posts (1 to 10 posts) all
                at once, each with its own photos, videos, and locations.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100/70 text-purple-700">
                  Up to 10 separate posts
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                  Add post button
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
