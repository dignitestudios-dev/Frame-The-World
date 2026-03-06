"use client";

import Image from "next/image";
import { ArrowRight, Bookmark, ChevronRight } from "lucide-react";
import Header from "@/components/global/header";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SaveModal from "@/components/global/SaveModal"; // ✅ adjust path if needed


export default function TravelStoryPage() {
  const [activeTab, setActiveTab] = useState<"forYou" | "featured" | "frames">("forYou");
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isSaveOpen, setIsSaveOpen] = useState(false); // State to control modal visibility


  const isFrames = activeTab === "frames";
  const router = useRouter();



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
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };


  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      {/* Sticky Header */}
      <Header />

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
      {[25, 15, 25, 15, 20].map((item, i) => (
        <div
          key={i}
          className="
            shrink-0
            snap-start
            min-w-[343px] h-[120px]
            rounded-3xl
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

          {/* Card Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <span className="text-white text-2xl font-bold">
              {item}+
            </span>
            <span className="text-sm text-gray-200">
              Frame name here
            </span>
          </div>

          {/* Bottom Right Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push("/framedetails");
            }}
            className="
              absolute bottom-3 right-3
              bg-transparent backdrop-blur
              rounded-full
              w-9 h-9
              flex items-center justify-center
              shadow-lg
             hover:scale-110
              transition
              z-10
            "
          >
            <ArrowRight className="w-5 h-5 text-white font-bold" />
          </button>
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
                          onClick={() => router.push("/framedetails")}

              className="relative overflow-hidden cursor-pointer rounded-[49.26px] shadow-[0_10px_25px_rgba(0,0,0,0.35)] w-[254px] h-[254px]"
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
          <div                           onClick={() => router.push("/postdetails")}

           className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[120px] gap-6 cursor-pointer">
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
      )}

      </div>
      <SaveModal
  isOpen={isSaveOpen} // Control modal visibility
  onClose={() => setIsSaveOpen(false)} // Close modal when clicking outside or pressing X
/>
    </div>
  );
}
