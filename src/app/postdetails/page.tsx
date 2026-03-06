"use client";

import Image from "next/image";
import { ArrowLeft, EllipsisVertical, Bookmark, MapPin, ArrowBigUpDash, Download } from "lucide-react";
import Header from "@/components/global/header";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SaveModal from "@/components/global/SaveModal";

export default function PostDetails() {
  const router = useRouter();
  const [isSaveOpen, setIsSaveOpen] = useState(false);

  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      <Header />

      <SaveModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
      />

      <div className="grid grid-cols-1 mt-8 p-4 pt-0 lg:grid-cols-[420px_1fr] gap-10 max-w-[1500px] mx-auto">

        {/* LEFT SIDE */}
        <div className="flex flex-col gap-4">
          <div className="relative h-[540px] rounded-[32px] overflow-hidden shadow-xl">
            <Image
              src="/images/2.jpg"
              alt="Eiffel Tower"
              fill
              className="object-cover"
            />

            <button
              onClick={() => router.back()}
              className="absolute top-5 left-5 h-11 w-11 rounded-md bg-white/30 flex items-center justify-center shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          <div className="px-2">
            {/* Title and Location Row */}
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-bold text-gray-900">Eiffel Tower</h2>
              <div className="flex items-center gap-1 text-gray-800">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-semibold">Paris, France</span>
              </div>
            </div>

            {/* Tags */}
            <p className="text-sm text-gray-400 mb-6">
              #Eiffel, #Tower, #land, #history
            </p>

            {/* Profile and Actions Row */}
            <div className="flex items-center justify-between">
              {/* Profile */}
             <div className="flex items-center gap-3">
  {/* Profile */}
  <div className="relative w-10 h-10 rounded-full overflow-hidden">
    <Image
      src="/images/2.jpg"
      alt="Author"
      fill
      className="object-cover"
    />
  </div>
  <span className="text-md font-bold text-gray-900">
    David Smith
  </span>
</div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* Upvote Button */}
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border-[1.5px] border-blue-500 text-blue-500 hover:bg-blue-50 transition">
                  <ArrowBigUpDash className="w-5 h-5 fill-current" />
                  <span className="font-bold">256</span>
                </button>

                {/* Save/Download Button */}
                <button 
                  onClick={() => setIsSaveOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-600 transition"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-bold">256</span>
                </button>

                {/* More Options Button */}
                <button
                                    onClick={() => setIsSaveOpen(true)}

                  className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-600 transition"
                >
                  <EllipsisVertical className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>
          <h3 className="text-lg font-semibold mb-6">
            More related to explore!
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 auto-rows-[120px] gap-6">
            {Array.from({ length: 20 }).map((_, i) => {
              const isTall = i % 3 === 0 || i % 2 === 0;

              return (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl hover:shadow-2xl transition
                    ${isTall ? "row-span-3" : "row-span-2"}`}
                >
                  <Image
                    src={`/images/${(i % 4) + 1}.jpg`}
                    alt="Travel"
                    fill
                    className="object-cover"
                  />

                  <button 
                    onClick={() => setIsSaveOpen(true)}
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