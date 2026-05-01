"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBadgesApi } from "@/services/userApi";

const LOCK_ICON = "/images/badge4.png";

export default function Badges() {
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const { data: badgesData, isLoading } = useQuery({
    queryKey: ["getUserBadges"],
    queryFn: getBadgesApi,
  });

  const closeModal = () => setSelectedBadge(null);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Badges Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {badgesData?.data?.map((badge: any, idx: number) => (
          <div
            key={badge._id}
            onClick={() => setSelectedBadge(badge)}
            className="group relative flex flex-col items-center justify-center bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_50px_rgba(93,146,243,0.15)] hover:scale-[1.03] transition-all cursor-pointer overflow-hidden border border-gray-100/50 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
          >
            <div className="relative w-20 h-20 md:w-28 md:h-28 mb-4">
              {badge.isLocked ? (
                <div className="absolute inset-0 bg-gray-100/30 rounded-full blur-xl scale-75"></div>
              ) : null}
              <Image
                src={badge.isLocked ? LOCK_ICON : badge?.icon?.location}
                alt={badge.isLocked ? badge?.name : "Locked badge"}
                fill
                className="object-contain relative z-10"
              />
            </div>
            {!badge.isLocked && (
              <span className="text-sm md:text-base font-bold text-gray-900 text-center tracking-tight">
                {badge.name}
              </span>
            )}
            {badge.isLocked && (
              <div className="absolute inset-0 bg-gray-400/5 backdrop-blur-[2px]"></div>
            )}
          </div>
        ))}
      </div>

      {/* Badge Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-[3rem] p-10 flex flex-col items-center shadow-2xl animate-in slide-in-from-bottom-12 duration-500 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Pull Handle */}
            <div className="absolute top-4 w-12 h-1.5 bg-gray-900 rounded-full opacity-10"></div>

            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="relative w-40 h-40 md:w-52 md:h-52 mb-8">
              <div className={`absolute inset-0 bg-gradient-to-b from-gray-100 to-transparent rounded-full blur-2xl scale-90 ${selectedBadge.isLocked ? "opacity-20" : "opacity-40"}`}></div>
              <Image
                src={selectedBadge?.icon?.location}
                alt={selectedBadge?.name}
                fill
                className={`relative object-contain ${selectedBadge.isLocked ? "" : "animate-in bounce-in duration-700"}`}
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-4 tracking-tight">
              {selectedBadge.name}
            </h2>

            <p className="text-sm md:text-base font-medium text-gray-500 text-center leading-relaxed">
              {selectedBadge.description}
            </p>

            <div className="mt-10 w-full flex justify-center">
              <div className="h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-200 w-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
