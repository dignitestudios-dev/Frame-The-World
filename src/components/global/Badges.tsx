"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBadgesApi } from "@/services/userApi";

const LOCK_BADGE_ICON = "/images/lockbadge.png";

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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {badgesData?.data?.map((badge: any, idx: number) => {
          const isLocked = badge?.isEarned === false;

          return (
            <div
              key={badge._id}
              onClick={() => setSelectedBadge(badge)}
              className="group relative flex flex-col items-center justify-center bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_50px_rgba(93,146,243,0.15)] hover:scale-[1.03] transition-all cursor-pointer overflow-hidden border border-gray-100/50 animate-in fade-in slide-in-from-bottom-4"
              style={{
                animationDelay: `${idx * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="relative w-20 h-20 md:w-28 md:h-28 mb-4">
                {badge?.icon?.location ? (
                  <Image
                    src={badge.icon.location}
                    alt={badge?.name || "Badge"}
                    fill
                    className={`object-contain ${isLocked ? "blur-[3px] opacity-50" : ""}`}
                  />
                ) : null}
                {isLocked && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <Image
                      src={LOCK_BADGE_ICON}
                      alt="Locked"
                      width={56}
                      height={56}
                      className="h-12 w-12 object-contain md:h-14 md:w-14"
                    />
                  </div>
                )}
              </div>
              <span className="text-sm md:text-base font-bold text-gray-900 text-center tracking-tight">
                {badge.name}
              </span>
            </div>
          );
        })}
      </div>

      {selectedBadge && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-[3rem] p-10 flex flex-col items-center shadow-2xl animate-in slide-in-from-bottom-12 duration-500 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 w-12 h-1.5 bg-gray-900 rounded-full opacity-10" />

            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="relative w-40 h-40 md:w-52 md:h-52 mb-8">
              <div
                className={`absolute inset-0 bg-gradient-to-b from-gray-100 to-transparent rounded-full blur-2xl scale-90 ${
                  selectedBadge?.isEarned === false ? "opacity-20" : "opacity-40"
                }`}
              />
              {selectedBadge?.icon?.location ? (
                <Image
                  src={selectedBadge.icon.location}
                  alt={selectedBadge?.name}
                  fill
                  className={`object-contain ${
                    selectedBadge?.isEarned === false
                      ? "blur-[4px] opacity-50"
                      : "animate-in bounce-in duration-700"
                  }`}
                />
              ) : null}
              {selectedBadge?.isEarned === false && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <Image
                    src={LOCK_BADGE_ICON}
                    alt="Locked"
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain md:h-24 md:w-24"
                  />
                </div>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-4 tracking-tight">
              {selectedBadge.name}
            </h2>

            <p className="text-sm md:text-base font-medium text-gray-500 text-center leading-relaxed">
              {selectedBadge.description}
            </p>

            {selectedBadge?.isEarned === false && (
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Not earned yet
              </p>
            )}

            <div className="mt-10 w-full flex justify-center">
              <div className="h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-200 w-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
