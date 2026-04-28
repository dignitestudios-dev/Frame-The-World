"use client";

import Image from "next/image";
import { useState, useEffect, Suspense, use } from "react";
import { LockIcon, X, Loader2, ImageOff, Building2, MapPin, Flag } from "lucide-react";
import Header from "@/components/global/header";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getBadgesApi, getSingleBadgeApi, getUserByIdApi, getSearchPostsApi, getSearchFramesApi } from "@/services/authApi";
import OwnPostCard from "@/components/profile/OwnPostCard";
import { usePostStore } from "@/store/PostStore";
import { ProfileSidebarSkeleton } from "@/components/global/Skeletons";
import OtherUserOptions from "@/components/profile/OtherUserOptions";

function OtherProfileContent({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "posts" | "frames") || "posts";
  const [activeTab, setActiveTab] = useState<"posts" | "frames">(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "posts" || tab === "frames")) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const { setPostDetails } = usePostStore();

  // Redirect to my profile if it's the current user
  useEffect(() => {
    if (currentUser?._id === userId) {
      router.replace("/Profile");
    }
  }, [currentUser, userId, router]);

  const handlePostClick = (post: any) => {
    const postId = post.id || post._id;
    if (post.status === "completed") {
      setPostDetails(post);
      router.push(`/postdetails?id=${postId}`);
    }
  };

  const LOCK_ICON = "/images/badge4.png";

  // Fetch target user profile
  const { data: targetUserData, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ["getUserById", userId],
    queryFn: () => getUserByIdApi(userId),
    enabled: !!userId,
  });

  const targetUser = targetUserData?.data || targetUserData;

  // Badges (Using getUserBadges logic but might need target user specific badges if API supports it)
  // For now, assuming badges are public or fetched via a common API if userId is provided
  // Postman shows /badges?page=1&limit=10, which might be public.
  // Actually, I'll use targetUser.badges if they are included in profile, otherwise stick to own badges for UI placeholder
  const badges = targetUser?.badges || [];

  const { data: badgeDetailData, isLoading: isBadgeDetailLoading } = useQuery({
    queryKey: ["getBadgeDetail", selectedBadge?._id || selectedBadge?.id],
    queryFn: () => getSingleBadgeApi(selectedBadge?._id || selectedBadge?.id),
    enabled: !!(selectedBadge?._id || selectedBadge?.id),
  });

  const badgeDetail = badgeDetailData?.data || badgeDetailData;

  // Fetch user posts
  const {
    data: postsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: () => getSearchPostsApi({ userId, limit: 30 }),
    enabled: activeTab === "posts" && !!userId,
  });

  const posts: any[] = postsData?.data || [];

  // Fetch user frames
  const {
    data: framesData,
    isLoading: isFramesLoading,
    isError: isFramesError,
  } = useQuery({
    queryKey: ["userFrames", userId],
    queryFn: () => getSearchFramesApi({ targetUserId: userId, limit: 30 }),
    enabled: activeTab === "frames" && !!userId,
  });

  const frames: any[] = framesData?.data || [];

  if (isUserError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <ImageOff className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
        <p className="text-gray-500 mb-6">The profile you are looking for does not exist or is unavailable.</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-blue-500 text-white rounded-full font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const isFrames = activeTab === "frames";
  const isPosts = activeTab === "posts";

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans">
      <Header
        title={`${targetUser?.name || "User"}'s Profile`}
        subtitle={`Exploring the world through ${targetUser?.name || "their"} lens.`}
      />
      <div className="min-h-screen bg-white px-8 py-10 font-sans text-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12">
          {/* ================= LEFT PROFILE CARD ================= */}
          {isUserLoading ? (
            <ProfileSidebarSkeleton />
          ) : (
            <aside className="relative lg:sticky lg:top-20 bg-[#f1f3f6] rounded-[30px] p-8 overflow-hidden shadow-sm h-fit">
              <div className="absolute top-6 right-6 z-20">
                <OtherUserOptions userId={userId} />
              </div>

              <div className="absolute top-0 left-0 w-full h-56 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <radialGradient id="peakGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="80" cy="50" r="60" fill="url(#peakGlow)" />
                  <circle cx="310" cy="80" r="50" fill="url(#peakGlow)" />
                  <path
                    d="M -10 130 L 30 130 L 80 50 L 140 160 L 190 110 L 250 110 L 310 80 L 350 140 L 410 140"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-40"
                  />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-[55px] bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_10px_20px_rgba(59,130,246,0.3)]" />
                  <div className="relative w-[92%] h-[92%] rounded-[50px] bg-[#f1f3f6] p-1 flex items-center justify-center">
                    <div className="relative w-full h-full rounded-[45px] overflow-hidden">
                      <img
                        src={targetUser?.profilePicture?.location || "/images/person.png"}
                        alt={targetUser?.name || "User"}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                <h2 className="mt-6 text-2xl font-bold text-[#1a1a1a] capitalize">
                  {targetUser?.name || "Anonymous User"}
                </h2>
                <p className="text-[13px] text-gray-500 mt-2 px-6 leading-relaxed text-center font-medium">
                  {targetUser?.bio || "No bio available."}
                </p>

                <div className="mt-4 text-center">
                  <p className="text-sm font-bold text-gray-800 capitalize">
                    <Building2 className="inline-block w-4 h-4 mb-1" /> {targetUser?.company?.name || "Independent"}
                  </p>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    <MapPin className="inline-block w-4 h-4 mb-1" /> {[
                      targetUser?.company?.address?.city,
                      targetUser?.company?.address?.state,
                      targetUser?.company?.address?.country,
                    ].filter(Boolean).join(", ") || "Location Unspecified"}
                  </p>
                </div>

                <div className="flex justify-center gap-8 w-full mt-8">
                  {[
                    { label: "Upvotes", value: targetUser?.upvotes },
                    { label: "Framed", value: targetUser?.framed },
                    { label: "Downloads", value: targetUser?.downloads }
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center">
                      <p className="text-[#4f46e5] text-xl font-black">{s.value ?? 0}</p>
                      <p className="text-[10px] text-gray-400 font-bold text-center tracking-tighter">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="w-full mt-10">
                  <h3 className="text-xl font-bold mb-6 text-gray-900 text-left w-full">Badges</h3>
                  {badges.length === 0 ? (
                    <p className="text-sm text-gray-400 font-semibold text-center py-4">No badges earned</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-y-6 gap-x-2 items-center justify-center">
                      {badges.map((badge: any, i: number) => {
                        const isLocked = !badge?.isEarned;
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                            onClick={() => setSelectedBadge(badge)}
                          >
                            <div className="relative w-12 h-12">
                              <Image
                                src={isLocked ? LOCK_ICON : badge?.icon?.location}
                                alt={badge?.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 tracking-tighter text-center line-clamp-1">
                              {badge?.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* ================= RIGHT CONTENT ================= */}
          <section>
            <div className="bg-[#e2e8f7] rounded-full flex mb-10 shadow-sm max-w-md">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition
                ${isPosts ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white shadow-md" : "text-gray-400 hover:text-blue-500"}`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab("frames")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition
                ${isFrames ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" : "text-gray-400 hover:text-blue-500"}`}
              >
                Frames
              </button>
            </div>

            {/* ================= POSTS GRID ================= */}
            {isPosts && (
              <div>
                {isPostsLoading && (
                  <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[120px] gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className={`rounded-[28px] bg-gray-100 animate-pulse ${i % 3 === 0 ? "row-span-3" : "row-span-2"}`} />
                    ))}
                  </div>
                )}
                {!isPostsLoading && posts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ImageOff className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="font-bold text-gray-800">No public posts</p>
                  </div>
                )}
                {!isPostsLoading && posts.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[120px] gap-6">
                    {posts.map((post: any, i: number) => (
                      <OwnPostCard
                        key={post._id || i}
                        post={post}
                        isTall={i % 3 === 0}
                        onClick={() => handlePostClick(post)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= FRAMES GRID ================= */}
            {isFrames && (
              <div>
                {isFramesLoading && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="w-[200px] h-[200px] bg-gray-100 rounded-[49.26px] animate-pulse" />
                    ))}
                  </div>
                )}
                {!isFramesLoading && frames.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ImageOff className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="font-bold text-gray-800">No public frames</p>
                  </div>
                )}
                {!isFramesLoading && frames.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {frames.map((frame: any, i: number) => {
                      const image = frame.cover?.location || `/images/${(i % 4) + 1}.jpg`;
                      const id = frame._id;
                      return (
                        <div key={id || i} className="flex flex-col items-center">
                          <div
                            className="relative overflow-hidden rounded-[49.26px] shadow-lg w-[200px] h-[200px] cursor-pointer"
                            onClick={() => id && router.push(`/frame-detail/${id}`)}
                          >
                            <img src={image} alt={frame.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <div className="text-center text-white p-2">
                                <span className="text-2xl font-bold block">{frame.totalPosts}+</span>
                                <span className="text-sm font-semibold line-clamp-1">{frame.title}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Badge Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md" onClick={() => setSelectedBadge(null)}>
          <div className="bg-[url('/images/badge_sheet.jpg')] bg-cover relative w-full max-w-sm rounded-[3rem] p-10 flex flex-col items-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedBadge(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            {isBadgeDetailLoading ? (
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin my-20" />
            ) : (
              <>
                <div className="relative w-40 h-40 mb-8">
                  <img src={badgeDetail?.isLocked ? LOCK_ICON : badgeDetail?.icon?.location} alt={badgeDetail?.name} className="object-contain" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 text-center mb-4">{badgeDetail?.name}</h2>
                <p className="text-sm font-medium text-gray-500 text-center leading-relaxed">
                  {badgeDetail?.description || "Achievement description unavailable."}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const unwrappedParams = use(params as any) as any;
  const userId = unwrappedParams.id;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>}>
      <OtherProfileContent userId={userId} />
    </Suspense>
  );
}
