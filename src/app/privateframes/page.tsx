"use client";

import Image from "next/image";
import { EllipsisVertical, PlusIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Header from "@/components/global/header";

export default function PrivateFrames() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-[#f5f6f8]">
            {/* Sticky Header */}
            <Header />
      <div className=" mx-auto px-6 py-6">

        {/* Top Header */}
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center gap-6 relative" ref={dropdownRef}>
            <span className="text-sm text-gray-500">24 pictures</span>

            <button className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center">
              <PlusIcon className="w-5 h-5 text-blue-500" />
            </button>

            <button
              onClick={() => setOpen(!open)}
              className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center"
            >
              <EllipsisVertical className="w-5 h-5 text-blue-500" />
            </button>

            {open && (
              <div className="absolute right-0 top-12 w-44 bg-white rounded-xl shadow-lg py-2">
                <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                  Rename Frame
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                  Make Private
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                  Delete Frame
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========== DATE GROUP 1 ========== */}
        <div className="mb-12 max-w-md">
          <p className="text-sm text-gray-500 mb-4">Oct/02/2023</p>

          <div className="w-56 h-56 relative rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/images/1.jpg"
              alt="Mushroom"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* ========== DATE GROUP 2 ========== */}
      <div>
  <p className="text-sm text-gray-500 mb-3">Nov/27/2023</p>

  <div className="grid grid-cols-[repeat(auto-fit,254px)] gap-3 justify-start">
    {[1, 2, 3, 4].map((item, i) => (
      <div
        key={i}
        className="relative w-[254px] h-[254px] rounded-2xl overflow-hidden shadow-sm"
      >
        <Image
          src={`/images/${item}.jpg`}
          alt="Gallery"
          fill
          className="object-cover"
        />
      </div>
    ))}
  </div>
</div>

      </div>
    </div>
  );
}