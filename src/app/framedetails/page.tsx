"use client";

import Image from "next/image";
import { Bookmark, EllipsisVertical, PlusIcon } from "lucide-react";
import Header from "@/components/global/header";
import { MapPin } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import SaveModal from "@/components/global/SaveModal"; // Import SaveModal

export default function framedetails() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false); // Modal state
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      {/* Sticky Header */}
      <Header />

      {/* Save Modal */}
      <SaveModal
        isOpen={isSaveOpen} // Control modal visibility
        onClose={() => setIsSaveOpen(false)} // Close modal
      />

      <div className="px-6 py-2">
        {/* Tabs */}
        <h1 className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Left Arrow */}
            <button
              onClick={() => router.back()}
              className="text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Location Pin & Address */}
            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="flex flex-col">
                <span className="font-semibold text-blue-600">Dallas St</span>
                <span className="text-sm text-black">La Mesa, CA 91942, USA</span>
              </div>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <PlusIcon className="text-blue-500 "/>
            </div>
            {/* Trigger Button */}
            <div>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition"
              >
                <EllipsisVertical className="text-blue-500" size={20} />
              </button>

              {/* Dropdown Menu */}
              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <button
                    onClick={() => {
                      console.log("Rename Frame");
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                   Delete Frame
                  </button>

                  <button
                    onClick={() => {
                      console.log("Make Private");
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    Make Frame Private
                  </button>

                  <button
                    onClick={() => {
                      console.log("Delete Frame");
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm  hover:bg-red-50 transition"
                  >
                    Rename Frame
                  </button>
                </div>
              )}
            </div>
          </div>
        </h1>

        {/* Masonry Grid */}
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 auto-rows-[120px] gap-6">
            {Array.from({ length: 20 }).map((_, i) => {
              const isTall = i % 5 === 0 || i % 7 === 0;

              return (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl hover:shadow-2xl transition
                    ${isTall ? "row-span-2 " : "row-span-3"}`}
                >
                  <Image
                    src={`/images/${(i % 4) + 1}.jpg`}
                    alt="Travel"
                    fill
                    className="object-cover"
                  />

                  {/* Bookmark Icon (opens SaveModal on click) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card navigation
                      setIsSaveOpen(true); // Open SaveModal
                    }}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow"
                  >
                    <Bookmark className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
