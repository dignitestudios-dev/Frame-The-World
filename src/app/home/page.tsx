"use client";

import Image from "next/image";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import Header from "@/components/global/header";

export default function TravelStoryPage() {
  const [activeTab, setActiveTab] = useState<"forYou" | "featured" | "frames">("forYou");

  const isFrames = activeTab === "frames";

  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      {/* Sticky Header */}
      <Header />

      <div className="px-6 py-4">

      {/* Story Slider */}
      <section
        className="
          flex flex-nowrap gap-4 px-6 pb-4 mb-6
          overflow-x-auto
          overscroll-x-contain
          scroll-smooth
          snap-x snap-mandatory
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
              rounded-4xl
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
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <span className="text-white text-2xl font-bold">{item}+</span>
              <span className="text-sm text-gray-200">Frame name here</span>
            </div>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pl-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[49.26px] shadow-[0_10px_25px_rgba(0,0,0,0.35)] w-[254px] h-[254px]"
            >
              {/* Outer Image */}
              <Image
                src={`/images/${(i % 4) + 1}.jpg`}
                alt="Frame"
                fill
                className="object-cover"
              />

              {/* Inner Frame Border (centered with inset) */}
              <div className="absolute inset-6 rounded-[40px] border-4 border-black/40 overflow-hidden">
                <Image
                  src={`/images/${((i + 1) % 4) + 1}.jpg`}
                  alt="Frame Inner"
                  fill
                  className="object-cover opacity-90"
                />
              </div>

              {/* Inner shadow glow */}
              <div className="absolute inset-0 rounded-[49.26px] shadow-[inset_0_0_0_8px_rgba(0,0,0,0.35)]" />

              {/* ====== SMALL IMAGE BEHIND TEXT (CENTERED) ====== */}
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <div className="relative w-[170px] h-[170px] rounded-[30px] overflow-hidden border border-white/20">
                  <Image
                    src={`/images/${((i + 2) % 4) + 1}.jpg`}
                    alt="Mini Frame"
                    fill
                    className="object-cover opacity-80"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="absolute inset-0 flex pt-34  flex-col  items-center text-white">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm mt-1">Frame Name</div>
              </div>
            </div>
          ))}
        </div>
      )}




      {/* Masonry Grid (default for other tabs) */}
      {!isFrames && (
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[120px] gap-6">
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

                  <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow">
                    <Bookmark className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
