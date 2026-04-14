"use client";

import Image from "next/image";
import { useState } from "react";
import { LockIcon, X, Loader2, ImageOff } from "lucide-react";
import Header from "@/components/global/header";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBadgesApi } from "@/services/authApi";
import { deletePostApi, getOwnPostsApi } from "@/services/postApi";
import { ProfileSidebarSkeleton, GridCardSkeleton } from "@/components/global/Skeletons";
import OwnPostCard from "@/components/profile/OwnPostCard";
import EditPostModal from "@/components/profile/EditPostModal";
import DeleteConfirmModal from "@/components/profile/DeleteConfirmModal";

export default function TravelStoryPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "frames" | "space">("posts");
  const [frameVisibility, setFrameVisibility] = useState("public");
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const LOCK_ICON = "/images/badge-lock-icon.png";

  const { data: badgesData, isLoading: isBadgesLoading } = useQuery({
    queryKey: ["getUserBadges"],
    queryFn: getBadgesApi,
  });

  // Fetch own posts
  const {
    data: ownPostsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["ownPosts"],
    queryFn: () => getOwnPostsApi({ page: 1, limit: 30 }),
    enabled: activeTab === "posts",
  });

  const ownPosts: any[] = ownPostsData?.data?.data || ownPostsData?.data?.results || ownPostsData?.data || [];

  // Delete mutation
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: (postId: string) => deletePostApi(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownPosts"] });
      setDeletingPostId(null);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    },
  });

  const handleConfirmDelete = () => {
    if (deletingPostId) deletePost(deletingPostId);
  };

  const isFrames = activeTab === "frames";
  const isPosts = activeTab === "posts";
  const isSpace = activeTab === "space";
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans">
      <Header />
      <div className="min-h-screen bg-white px-8 py-10 font-sans text-[#1a1a1a]">


        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12">

          {/* ================= LEFT PROFILE CARD ================= */}
          {isBadgesLoading ? (
            <ProfileSidebarSkeleton />
          ) : (
            <aside className="relative lg:sticky lg:top-20 bg-[#f1f3f6] rounded-[30px] p-8 overflow-hidden shadow-sm h-fit">
              {/* Profile card content... */}
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
                  {[
                    { x: 30, y: 130 }, { x: 80, y: 50 }, { x: 140, y: 160 },
                    { x: 190, y: 110 }, { x: 250, y: 110 }, { x: 310, y: 80 },
                    { x: 350, y: 140 }
                  ].map((dot, i) => (
                    <circle key={i} cx={dot.x} cy={dot.y} r="4.5" fill="#3b82f6" />
                  ))}
                </svg>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-[55px] bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_10px_20px_rgba(59,130,246,0.3)]" />
                  <div className="relative w-[92%] h-[92%] rounded-[50px] bg-[#f1f3f6] p-1 flex items-center justify-center">
                    <div className="relative w-full h-full rounded-[45px] overflow-hidden">
                      <Image
                        src={user?.profilePicture?.location || user?.profilePicture || "/images/admin.png"}
                        alt={user?.name || "User"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-[#1a1a1a] capitalize">{user?.name || "Anonymous User"}</h2>
                <p className="text-[13px] text-gray-500 mt-2 px-6 leading-relaxed text-center font-medium">
                  {user?.bio || "No bio available."}
                </p>
                <div className="mt-4 text-center">
                  <p className="text-sm font-bold text-gray-800 capitalize">{user?.company?.name || "Independent"}</p>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {[user?.company?.address?.city, user?.company?.address?.state, user?.company?.address?.country].filter(Boolean).join(", ") || "Location Unspecified"}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2 w-full mt-8">
                  {[
                    { label: "Up votes", value: 350 },
                    { label: "Framed", value: 32 },
                    { label: "Posts", value: 64 },
                    { label: "Frames", value: 64 },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center">
                      <p className="text-[#4f46e5] text-xl font-black">{s.value}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="w-full mt-10">
                  <h3 className="text-xl font-bold mb-6 text-gray-900 text-left w-full">Achievements</h3>
                  <div className="grid grid-cols-4 gap-y-6 gap-x-2 min-h-[100px] items-center justify-center">
                    {isBadgesLoading ? (
                      <div className="col-span-4 flex justify-center py-4">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      </div>
                    ) : (
                      badgesData?.data?.map((badge: any, i: number) => {
                        const isLocked = badge?.isLocked;
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                            onClick={() => setSelectedBadge(badge)}
                          >
                            <div className="relative w-12 h-12">
                              {isLocked && (
                                <div className="absolute inset-0 bg-gray-100/30 rounded-full blur-md scale-75 z-0"></div>
                              )}
                              <Image
                                src={isLocked ? LOCK_ICON : badge?.icon}
                                alt={!isLocked ? badge?.name : "Locked badge"}
                                fill
                                className={`object-contain relative z-10 ${isLocked ? "opacity-80 grayscale-[0.5]" : ""}`}
                              />
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter text-center line-clamp-1">
                              {badge?.name}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}
          {/* ================= RIGHT CONTENT ================= */}
          <section className="">
            <div className="bg-[#e2e8f7] rounded-full flex mb-10 shadow-sm">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition
      ${isPosts
                    ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white shadow-md"
                    : "text-gray-400 hover:text-blue-500"
                  }`}
              >
                <div className="relative w-4 h-4">
                  <Image
                    src="/images/posts.png"
                    alt="Posts"
                    fill
                    className="object-contain"
                  />
                </div>
                Posts
              </button>

              <button
                onClick={() => setActiveTab("frames")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition
      ${isFrames
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "text-gray-400 hover:text-blue-500"
                  }`}
              >
                <div className="relative w-4 h-4">
                  <Image
                    src="/images/frames.png"
                    alt="Frames"
                    fill
                    className="object-contain"
                  />
                </div>
                Frames
              </button>

              <button
                onClick={() => setActiveTab("space")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition
      ${activeTab === "space"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "text-gray-400 hover:text-blue-500"
                  }`}
              >
                <div className="relative w-4 h-4">
                  <Image
                    src="/images/lock.png"
                    alt="My Space"
                    fill
                    className={`object-contain ${activeTab === "space" ? "opacity-100" : "opacity-60"
                      }`}
                  />
                </div>
                My Space
              </button>
            </div>

            {/* ============ SUCCESS TOASTS ============ */}
            {editSuccess && (
              <div className="fixed top-5 right-5 z-[200] flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-2xl shadow-lg animate-in slide-in-from-top-3 duration-300">
                <span className="font-semibold text-sm">✓ Post updated successfully!</span>
              </div>
            )}
            {deleteSuccess && (
              <div className="fixed top-5 right-5 z-[200] flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-2xl shadow-lg animate-in slide-in-from-top-3 duration-300">
                <span className="font-semibold text-sm">✓ Post deleted successfully!</span>
              </div>
            )}

            {/* ================= POSTS GRID ================= */}
            {isPosts && (
              <div>
                {/* Loading Skeleton */}
                {isPostsLoading && (
                  <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[120px] gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-[28px] bg-gray-100 animate-pulse ${i % 3 === 0 || i % 2 === 0 ? "row-span-3" : "row-span-2"}`}
                      />
                    ))}
                  </div>
                )}

                {/* Error State */}
                {isPostsError && !isPostsLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                      <ImageOff className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 mb-1">Failed to load posts</p>
                      <p className="text-sm text-gray-400">Something went wrong. Please try again.</p>
                    </div>
                    <button
                      onClick={() => refetchPosts()}
                      className="px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {!isPostsLoading && !isPostsError && ownPosts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                      <ImageOff className="w-10 h-10 text-blue-300" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 mb-1">No posts yet</p>
                      <p className="text-sm text-gray-400">Create your first post to see it here.</p>
                    </div>
                  </div>
                )}

                {/* Real Posts Grid */}
                {!isPostsLoading && !isPostsError && ownPosts.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[120px] gap-6">
                    {ownPosts.map((post: any, i: number) => (
                      <OwnPostCard
                        key={post.id || post._id || i}
                        post={post}
                        isTall={i % 3 === 0 || i % 2 === 0}
                        onClick={() => router.push(`/postdetails`)}
                        onEdit={(p) => setEditingPost(p)}
                        onDelete={(postId) => setDeletingPostId(postId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* ================= FRAMES GRID ================= */}
            {isFrames && (
              <div className="pl-2">

                {/* 🔘 PUBLIC / PRIVATE PILLS */}
                <div className="flex gap-3 justify-center mb-6">
                  <button
                    onClick={() => setFrameVisibility("public")}
                    className={`px-5 py-2 rounded-full text-sm  transition
          ${frameVisibility === "public"
                        ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white shadow-md"
                        : "bg-blue-100 text-gray-400 border border-gray-200 hover:text-black"
                      }`}
                  >
                    Public
                  </button>

                  <button
                    onClick={() => setFrameVisibility("private")}
                    className={`px-5 py-2 rounded-full text-sm transition
          ${frameVisibility === "private"
                        ? "bg-gradient-to-r  from-[#6CACDF] to-[#0000FE] text-white shadow-md"
                        : "bg-blue-100 text-gray-400 border border-gray-200 hover:text-black"
                      }`}
                  >
                    Private
                  </button>
                </div>

                {/* 🖼️ FRAMES GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">

                      {/* Frame Card */}
                      <div
                        className="relative overflow-hidden rounded-[49.26px]
        shadow-[0_10px_25px_rgba(0,0,0,0.35)]
        w-[200px] h-[200px]"
                      >
                        <Image
                          src={`/images/${(i % 4) + 1}.jpg`}
                          alt="Frame"
                          fill
                          className="object-cover cursor-pointer"
                          onClick={() => router.push("/framedetails")}

                        />

                        <div className="absolute inset-6 rounded-[40px] border-4 border-black/40 overflow-hidden">
                          <Image
                            src={`/images/${((i + 1) % 4) + 1}.jpg`}
                            alt="Inner Frame"
                            fill
                            className="object-cover opacity-90"
                          />
                        </div>
                        <div className="absolute inset-0 shadow-[inset_0_0_0_8px_rgba(0,0,0,0.35)] rounded-[49.26px]" />
                        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                          <div className="relative w-[170px] h-[170px] rounded-[30px] overflow-hidden border border-white/20">
                            <Image
                              src={`/images/${((i + 2) % 4) + 1}.jpg`}
                              alt="Mini"
                              fill
                              className="object-cover opacity-80"
                            />
                          </div>
                        </div>
                        {/* Optional: Keep only the count inside */}
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <div onClick={() => router.push("/privateframes")}
                            className="text-3xl font-bold pt-20 cursor-pointer">15+</div>
                        </div>
                      </div>
                      {/* Frame Name BELOW */}
                      <div className="mt-4 text-center">
                        <div className="text-[16px] font-semibold text-gray-800">
                          Frame Name
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= FRAMES GRID ================= */}
            {isSpace && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pl-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const frameNumber = (i % 4) + 1;
                  const frameName = `Frame ${i + 1}`;

                  return (
                    <div key={i} className="flex flex-col items-center">

                      {/* Image Card */}
                      <div
                        className="relative overflow-hidden rounded-[24px]
              shadow-[0_10px_25px_rgba(0,0,0,0.35)]
              w-[200px] h-[200px]"
                        onClick={() => router.push("/framedetails")}

                      >
                        <Image
                          src={`/images/${frameNumber}.jpg`}
                          alt={frameName}
                          fill
                          className="object-cover cursor-pointer"

                        />

                        {/* LOCK ICON */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/30 shadow-3xl">
                            <LockIcon className="text-white w-10 h-10" />
                          </div>
                        </div>
                      </div>

                      {/* Frame Name */}
                      <p className="mt-3 text-sm font-semibold text-black text-center">
                        Frame Name
                      </p>

                    </div>
                  );
                })}
              </div>
            )}

          </section>
        </div>
      </div>

      {/* Badge Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-[3rem] p-10 flex flex-col items-center shadow-2xl animate-in slide-in-from-bottom-12 duration-500 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Pull Handle */}
            <div className="absolute top-4 w-12 h-1.5 bg-gray-900 rounded-full opacity-10"></div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="relative w-40 h-40 md:w-52 md:h-52 mb-8">
              <div className={`absolute inset-0 bg-gradient-to-b from-gray-100 to-transparent rounded-full blur-2xl scale-90 ${selectedBadge.isLocked ? "opacity-20" : "opacity-40"}`}></div>
              <Image
                src={selectedBadge.isLocked ? LOCK_ICON : selectedBadge.icon}
                alt={selectedBadge.name}
                fill
                className={`relative object-contain ${selectedBadge.isLocked ? "" : "animate-in bounce-in duration-700"}`}
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-4 tracking-tight">
              {selectedBadge.name}
            </h2>

            <p className="text-sm md:text-base font-medium text-gray-500 text-center leading-relaxed">
              {selectedBadge.description || "The user hasn't unlocked this achievement yet."}
            </p>

            <div className="mt-10 w-full flex justify-center">
              <div className="h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-200 w-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT POST MODAL ===== */}
      <EditPostModal
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onSuccess={() => {
          setEditSuccess(true);
          setTimeout(() => setEditSuccess(false), 3000);
        }}
      />

      {/* ===== DELETE CONFIRM MODAL ===== */}
      <DeleteConfirmModal
        isOpen={!!deletingPostId}
        isPending={isDeleting}
        onClose={() => setDeletingPostId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}