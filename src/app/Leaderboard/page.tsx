"use client";

import Image from "next/image";
import Header from "./../../components/global/header";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboardApi } from "@/services/postApi";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const DUMMY_AVATAR = "/images/dummy.png";
const BLUE_GRADIENT =
  "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)";
const BLUE_GRADIENT_SOFT =
  "linear-gradient(134.74deg, rgba(108, 172, 223, 0.15) 3.24%, rgba(0, 0, 254, 0.15) 139.86%)";

const DUMMY_PODIUM = [
  { rank: 3 as const, size: "sm" as const },
  { rank: 1 as const, size: "lg" as const },
  { rank: 2 as const, size: "md" as const },
];

const DUMMY_RANKS = [4, 5, 6, 7, 8, 9] as const;

const CONTENT_MAX_W = "max-w-[480px]";
const PODIUM_AVATAR = { sm: 96, md: 110, lg: 140 } as const;
const TAB_HEIGHT = "h-12";
const AVATAR_BORDER =
  "overflow-hidden rounded-full border-2 border-[#5385E6]";

function formatRank(rank: number) {
  return rank < 10 ? `0${rank}` : String(rank);
}

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

  const rawUsers =
    activeTab === "upvotes"
      ? leaderboardData?.data?.topUpvotedUsers
      : leaderboardData?.data?.topDownloadedUsers;

  const leaderboardUsers = (rawUsers || [])
    .filter((item) => item?.user?._id)
    .map((item) => ({
      _id: item.user._id,
      name:
        item.user._id === currentUser?._id
          ? "You"
          : item.user.name || "Anonymous",
      profilePicture: item.user.profilePicture,
      score: (activeTab === "upvotes" ? item.upvotes : item.downloads) || 0,
      rank: item.rank,
      isCurrentUser: item.user._id === currentUser?._id,
    }));

  const sortedPodium = [
    leaderboardUsers.find((u) => u.rank === 3),
    leaderboardUsers.find((u) => u.rank === 1),
    leaderboardUsers.find((u) => u.rank === 2),
  ].filter(Boolean);

  const remainingUsers = leaderboardUsers.filter((u) => u.rank > 3);

  const showPodiumPlaceholder =
    isLoading || (!isError && sortedPodium.length === 0);
  const showListPlaceholder =
    !isError && (isLoading || remainingUsers.length === 0);
  const showSegment =
    !isError &&
    (isLoading || sortedPodium.length > 0 || remainingUsers.length > 0);

  const scoreIcon =
    activeTab === "upvotes"
      ? "/images/bxs_upvote.png"
      : "/images/image-icon.png";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header
        title="Leaderboard."
        subtitle="Check out who's at the top of the leaderboard right now."
      />

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-4 md:px-8">
        {isError ? (
          <div className="py-20 text-center text-sm font-medium text-red-500">
            Error loading leaderboard data.
          </div>
        ) : (
          <div className={`mx-auto flex w-full ${CONTENT_MAX_W} flex-col items-center`}>
            {/* Podium — order: 3rd, 1st, 2nd */}
            <div className="flex w-full items-end justify-between gap-3 overflow-visible pt-5 sm:gap-5">
              {showPodiumPlaceholder ? (
                <LeaderboardPodiumPlaceholder scoreIcon={scoreIcon} />
              ) : (
                sortedPodium.map((u, idx) => (
                  <TopUser
                    key={u?._id || idx}
                    rank={u?.rank || 0}
                    img={u?.profilePicture?.location || DUMMY_AVATAR}
                    name={u?.name || "Unknown"}
                    votes={u?.score || 0}
                    size={
                      u?.rank === 1 ? "lg" : u?.rank === 2 ? "md" : "sm"
                    }
                    scoreIcon={scoreIcon}
                    onClick={() => u?._id && handleUserClick(u._id)}
                  />
                ))
              )}
            </div>

            {/* Tab switcher */}
            {showSegment && (
              <div className={`relative mt-6 w-full ${CONTENT_MAX_W} ${TAB_HEIGHT}`}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: BLUE_GRADIENT_SOFT }}
                />
                <div
                  className={`absolute top-0 ${TAB_HEIGHT} w-1/2 rounded-full transition-transform duration-300 ease-out`}
                  style={{
                    background: BLUE_GRADIENT,
                    transform:
                      activeTab === "framed"
                        ? "translateX(100%)"
                        : "translateX(0)",
                  }}
                />
                <div className={`relative z-10 flex w-full ${TAB_HEIGHT}`}>
                  <button
                    type="button"
                    onClick={() => setActiveTab("upvotes")}
                    disabled={isLoading}
                    className={`relative z-10 flex flex-1 items-center justify-center text-sm leading-5 transition-colors ${
                      activeTab === "upvotes"
                        ? "font-bold text-white"
                        : "font-normal text-black"
                    } ${isLoading ? "opacity-60" : ""}`}
                  >
                    UpVotes
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("framed")}
                    disabled={isLoading}
                    className={`relative z-10 flex flex-1 items-center justify-center text-sm leading-5 transition-colors ${
                      activeTab === "framed"
                        ? "font-bold text-white"
                        : "font-normal text-black"
                    } ${isLoading ? "opacity-60" : ""}`}
                  >
                    Framed
                  </button>
                </div>
              </div>
            )}

            {/* Rank list */}
            <div className={`mt-4 w-full ${CONTENT_MAX_W} space-y-1`}>
              {showListPlaceholder ? (
                <LeaderboardListPlaceholder scoreIcon={scoreIcon} />
              ) : (
                remainingUsers.map((u) => (
                  <LeaderboardListRow
                    key={u._id}
                    rank={u.rank}
                    name={u.name}
                    score={u.score}
                    avatar={u.profilePicture?.location || DUMMY_AVATAR}
                    scoreIcon={scoreIcon}
                    isCurrentUser={u.isCurrentUser}
                    onAvatarClick={() => handleUserClick(u._id)}
                    onNameClick={() => handleUserClick(u._id)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardPodiumPlaceholder({ scoreIcon }: { scoreIcon: string }) {
  return (
    <>
      {DUMMY_PODIUM.map((row) => (
        <TopUser
          key={`dummy-podium-${row.rank}`}
          rank={row.rank}
          img={DUMMY_AVATAR}
          name=""
          votes={0}
          size={row.size}
          scoreIcon={scoreIcon}
          isPlaceholder
        />
      ))}
    </>
  );
}

function LeaderboardListPlaceholder({ scoreIcon }: { scoreIcon: string }) {
  return (
    <div
      className="pointer-events-none select-none space-y-[5px] opacity-70"
      aria-hidden
    >
      {DUMMY_RANKS.map((rank) => (
        <div
          key={`dummy-list-${rank}`}
          className="flex h-14 items-center justify-between rounded-full bg-black/[0.03] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="w-[17px] text-center text-xs font-bold leading-[15px] text-black">
              {formatRank(rank)}
            </span>
            <div className={`relative h-7 w-7 shrink-0 ${AVATAR_BORDER} bg-black/10`}>
              <Image
                src={DUMMY_AVATAR}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-bold leading-4 text-black">0</span>
            <img src={scoreIcon} className="h-4 w-4" alt="" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardListRow({
  rank,
  name,
  score,
  avatar,
  scoreIcon,
  isCurrentUser,
  onAvatarClick,
  onNameClick,
}: {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  scoreIcon: string;
  isCurrentUser?: boolean;
  onAvatarClick: () => void;
  onNameClick: () => void;
}) {
  return (
    <div className="flex h-14 items-center justify-between gap-6 rounded-full bg-black/[0.03] px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="w-[17px] shrink-0 text-center text-xs font-bold leading-[15px] text-black">
          {formatRank(rank)}
        </span>
        <button
          type="button"
          onClick={onAvatarClick}
          className={`relative h-7 w-7 shrink-0 ${AVATAR_BORDER} bg-[#D9D9D9] transition-transform active:scale-95`}
        >
          <Image
            src={avatar}
            alt={name}
            fill
            sizes="32px"
            className="object-cover"
          />
        </button>
        <button
          type="button"
          onClick={onNameClick}
          className={`truncate text-xs font-medium leading-4 text-black hover:underline ${
            isCurrentUser ? "font-semibold" : ""
          }`}
        >
          {name}
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="text-xs font-bold leading-4 text-black pt-[3px]">{score}</span>
        <img src={scoreIcon} className="h-4 w-4" alt="" />
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
  scoreIcon,
  onClick,
  isPlaceholder,
}: {
  rank: number;
  img: string;
  name: string;
  votes: number;
  size: "sm" | "md" | "lg";
  scoreIcon: string;
  onClick?: () => void;
  isPlaceholder?: boolean;
}) {
  const avatarPx = PODIUM_AVATAR[size];
  const gapBelow = size === "lg" ? "gap-1.5" : "gap-2";

  const rankBadgeClass =
    rank === 2
      ? "right-0 -top-3 translate-x-1/4"
      : "left-0 -top-0 -translate-x-1/4";

  const interactive = Boolean(onClick) && !isPlaceholder;

  return (
    <div
      className={`flex flex-col items-center overflow-visible ${gapBelow} ${
        size === "lg" ? "max-w-[140px]" : size === "md" ? "max-w-[118px]" : "max-w-[100px]"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-visible ${interactive ? "cursor-pointer active:scale-[0.98]" : ""}`}
        style={{ width: avatarPx, height: avatarPx }}
        onClick={onClick}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") onClick?.();
              }
            : undefined
        }
      >
        <div
          className={`absolute inset-0 z-0 ${AVATAR_BORDER} ${size === "lg" ? "border-[3px]" : ""}`}
        >
          <Image
            src={img}
            alt={name.trim() ? name : "User"}
            fill
            sizes={`${avatarPx}px`}
            className={`object-cover ${isPlaceholder ? "opacity-60" : ""}`}
          />
        </div>
        <div
          className={`pointer-events-none absolute z-50 flex h-9 min-w-8 items-center justify-center rounded-full px-2.5 py-1 shadow-md ${rankBadgeClass}`}
          style={{ background: BLUE_GRADIENT }}
        >
          <span className="text-center text-sm font-bold leading-none tracking-tight text-white">
            {rank}
          </span>
        </div>
      </div>

      {name.trim() ? (
        <div className="flex w-full flex-col items-center gap-1">
          <p
            className={`w-full truncate text-center text-base font-medium leading-5 text-black ${
              interactive ? "cursor-pointer hover:underline" : ""
            }`}
            onClick={onClick}
          >
            {name}
          </p>
          <div className="flex items-center justify-center">
            <span className="text-center text-sm font-bold leading-5 text-black">
              {votes}
            </span>
            <img src={scoreIcon} className="h-6 w-6" alt="" />
          </div>
        </div>
      ) : (
        <div className="h-12" aria-hidden />
      )}
    </div>
  );
}
