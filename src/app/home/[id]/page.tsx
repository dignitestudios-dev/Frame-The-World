"use client";

import Image from "next/image";
import { Search, Bell, Bookmark, ArrowLeft, Hamburger, EllipsisVertical } from "lucide-react";
import Header from "@/components/global/header";

export default function TravelStoryPage() {
  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      {/* ================= HEADER ================= */}
      <Header/>

      {/* ================= MAIN ================= */}
      <div className="grid grid-cols-1 mt-8 p-4 pt-0 lg:grid-cols-[420px_1fr] gap-10 max-w-[1500px] mx-auto">
        
        {/* ================= LEFT FEATURE ================= */}
     <div className="flex flex-col gap-4">
  {/* IMAGE */}
  <div className="relative h-[540px] rounded-[32px] overflow-hidden shadow-xl">
    <Image
      src="/images/2.jpg"
      alt="Eiffel Tower"
      fill
      className="object-cover"
    />

    <button className="absolute top-5 left-5 h-11 w-11 rounded-md bg-white/30 flex items-center justify-center shadow">
      <ArrowLeft className="h-5 w-5 text-gray-700" />
    </button>
  </div>

  {/* BELOW IMAGE INFO */}
  <div className="px-2">
    <h2 className="text-lg font-semibold">Eiffel Tower</h2>
    <p className="text-sm text-gray-500 mb-4">
      #selfie, #tower, #land, #history
    </p>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Image
          src="/images/1.jpg"
          alt="Author"
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="text-sm font-medium">David Smith</span>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-3 text-blue-500 rounded-full border border-blue-500 text-xs font-semibold">
          ↑ 256
        </button>
        <button className="px-3 py-1 rounded-full text-white border bg-blue-500 text-xs font-semibold">
          ↓ 256
        </button>
          <button className="px-2 py-1 rounded-full text-blue-500 border border-blue-500 text-xs font-semibold">
          <EllipsisVertical />
        </button>
      </div>
    </div>
  </div>
</div>


        {/* ================= RIGHT GRID ================= */}
        <div>
          <h3 className="text-lg font-semibold mb-6">
            More related to explore!
          </h3>

          {/* TRUE MASONRY */}
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 auto-rows-[120px] gap-6">
                     {Array.from({ length: 20 }).map((_, i) => {
                       const isTall = i % 3 === 0 || i % 2 === 0;
         
                       return (
                         <div
                           key={i}
                           className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl hover:shadow-2xl transition
                             ${isTall ? "row-span-3 " : "row-span-2"}`}
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
      </div>
    </div>
  );
}
