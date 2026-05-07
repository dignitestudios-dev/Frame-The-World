"use client";

import Image from "next/image";
import Header from './../../components/global/header';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboardApi } from "@/services/postApi";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function TravelStoryPage() {
  const [activeTab, setActiveTab] = useState<"upvotes" | "framed">("upvotes");
  const { user: currentUser } = useAuthStore();
  const router = useRouter();

  const { data: leaderboardData, isLoading, isError } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboardApi,
  });

  const handleUserClick = (userId: string) => {
    if (userId === currentUser?._id) {
      router.push("/Profile");
    } else {
      router.push(`/Profile/${userId}`);
    }
  };

  const rawUsers = activeTab === "upvotes"
    ? leaderboardData?.data?.topUpvotedUsers
    : leaderboardData?.data?.topDownloadedUsers;

  const leaderboardUsers = (rawUsers || []).map((item) => ({
    _id: item.user._id,
    name: item.user._id === currentUser?._id ? "You" : (item.user.name || "Anonymous"),
    profilePicture: item.user.profilePicture,
    score: (activeTab === "upvotes" ? item.upvotes : item.downloads) || 0,
    rank: item.rank,
    isCurrentUser: item.user._id === currentUser?._id,
  }));

  const podiumUsers = [
    leaderboardUsers.find(u => u.rank === 1),
    leaderboardUsers.find(u => u.rank === 2),
    leaderboardUsers.find(u => u.rank === 3),
  ].filter(Boolean);

  // For the podium layout [rank 2, rank 1, rank 3]
  const sortedPodium = [
    leaderboardUsers.find(u => u.rank === 2),
    leaderboardUsers.find(u => u.rank === 1),
    leaderboardUsers.find(u => u.rank === 3),
  ].filter(Boolean);

  const remainingUsers = leaderboardUsers.filter(u => u.rank > 3);

  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      <Header title="Leaderboard." subtitle="Check out who's at the top of the leaderboard right now" />
      <div className="min-h-screen bg-[#f6f7fb] px-6 pb-20">
        <div className="mx-auto p-6">

          {
            sortedPodium.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <img src="/images/no-found.png" className="w-[250px] h-[250px] " alt="" />
              </div>
            )
          }

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500 font-medium">
              Error loading leaderboard data.
            </div>
          ) : (
            <>
              {/* ================= TOP 3 ================= */}
              <div className="mt-8 flex justify-center items-end gap-6 md:gap-12">
                {sortedPodium.map((u, idx) => (
                  <TopUser
                    key={u?._id || idx}
                    rank={u?.rank || 0}
                    img={u?.profilePicture?.location || "/images/person.png"}
                    name={u?.name || "Unknown"}
                    votes={u?.score || 0}
                    size={u?.rank === 1 ? "lg" : "sm"}
                    activeTab={activeTab}
                    isCurrentUser={u?.isCurrentUser}
                    onClick={() => u?._id && handleUserClick(u._id)}
                  />
                ))}
              </div>

              {/* ================= SEGMENT ================= */}
              {
                remainingUsers.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <div className="w-[340px] bg-[#eef1fb] rounded-full p-1 flex">
                      <button
                        onClick={() => setActiveTab("upvotes")}
                        className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${activeTab === "upvotes"
                          ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white"
                          : "text-gray-500"
                          }`}
                      >
                        UpVotes
                      </button>
                      <button
                        onClick={() => setActiveTab("framed")}
                        className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${activeTab === "framed"
                          ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white"
                          : "text-gray-500"
                          }`}
                      >
                        Framed
                      </button>
                    </div>
                  </div>
                )
              }
              {/* ================= TOP LIST ================= */}
              <div className="mt-4 max-w-2xl mx-auto p-6 space-y-3">
                {remainingUsers.map((u) => (
                  <div
                    key={u._id}
                    className={`flex items-center justify-between p-4 rounded-full transition-all ${u.isCurrentUser
                      ? "gradient-bg text-white shadow-lg shadow-red-200"
                      : "bg-gray-200 text-black"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-sm w-6 ${u.isCurrentUser ? "text-white" : "text-black"}`}>
                        {u.rank < 10 ? `0${u.rank}` : u.rank}
                      </span>

                      <div
                        className="relative w-8 h-8 rounded-full overflow-hidden cursor-pointer active:scale-90 transition-transform ring-1 ring-white/20"
                        onClick={() => handleUserClick(u._id)}
                      >
                        <Image
                          src={u.profilePicture?.location || "/images/person.png"}
                          alt={u.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>

                      <span
                        className="text-sm font-bold cursor-pointer hover:underline underline-offset-2"
                        onClick={() => handleUserClick(u._id)}
                      >
                        {u.name}
                      </span>
                    </div>

                    <div className={`flex items-center gap-1 font-bold text-sm ${u.isCurrentUser ? "text-white" : "text-blue-500"}`}>
                      {u.score}
                      <img
                        src={activeTab === "upvotes" ? "/images/bxs_upvote.png" : "/images/image-icon.png"}
                        className={`h-4 ${u.isCurrentUser ? "" : ""}`}
                        alt="icon"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TopUser({
  rank,
  img,
  name,
  votes,
  size,
  activeTab,
  isCurrentUser,
  onClick,
}: {
  rank: number;
  img: string;
  name: string;
  votes: number;
  size: "sm" | "lg";
  activeTab: "upvotes" | "framed";
  isCurrentUser?: boolean;
  onClick?: () => void;
}) {
  const avatarSize = size === "lg" ? 110 : 86;
  const rankPosition = rank === 2 ? "top-0 right-0 translate-x-1/4 -translate-y-1/4" : "top-0 left-0 -translate-x-1/4 -translate-y-1/4";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative cursor-pointer group active:scale-95 transition-transform`}
        style={{ width: avatarSize, height: avatarSize }}
        onClick={onClick}
      >
        <Image
          src={img}
          alt={name}
          fill
          className={`rounded-full object-cover ring-4 ${isCurrentUser ? "ring-red-500 animate-pulse" : "ring-blue-500"} transition-all`}
        />
        <div className={`absolute ${rankPosition} h-6 w-6 rounded-xl ${isCurrentUser ? "bg-red-500" : "bg-blue-500"} text-white text-sm font-semibold flex items-center justify-center shadow-md`}>
          {rank}
        </div>
      </div>

      <p className={`mt-4 text-sm font-bold cursor-pointer hover:underline underline-offset-2 ${isCurrentUser ? "text-red-600" : "text-gray-800"}`} onClick={onClick}>
        {name}
      </p>

      <div className={`flex items-center gap-1 text-sm font-bold ${isCurrentUser ? "text-red-500" : "text-blue-500"}`}>
        {votes}
        <img
          src={activeTab === "upvotes" ? "/images/bxs_upvote.png" : "/images/image-icon.png"}
          className={`h-4 ${isCurrentUser ? "" : ""}`}
          alt="icon"
        />
      </div>
    </div>
  );
}