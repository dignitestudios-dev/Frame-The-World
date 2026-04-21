"use client";

import Image from "next/image";
import {
  ArrowBigUpDash,
  ArrowLeft,
  Bookmark,
  Download,
  EllipsisVertical,
  MapPin,
  BarChart3,
} from "lucide-react";
import Header from "@/components/global/header";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import SaveModal from "@/components/global/SaveModal";
import { usePostStore } from "@/store/PostStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePostApi,
  downloadPostApi,
  upvotePostApi,
  getPostApi,
  updatePostApi,
  getAllPostsApi,
} from "@/services/postApi";
import AnalyzingModal from "@/components/createpost/AnalyzingModalProps";
import EditPostModal from "@/components/profile/EditPostModal";
import DeleteConfirmModal from "@/components/profile/DeleteConfirmModal";
import InsightsModal from "@/components/post/InsightsModal";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/lib/apiError";
import { Toast } from "@/components/ui/toast";

const FALLBACK_POST_IMAGE =
  "https://t4.ftcdn.net/jpg/07/91/22/59/360_F_791225927_caRPPH99D6D1iFonkCRmCGzkJPf36QDw.jpg";
const FALLBACK_AVATAR = "/images/person.png";

type ToastState = {
  open: boolean;
  message: string;
  type: "success" | "error";
};

const getEntityId = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value._id || value.id || null;
};

const getSafeCount = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getReturnedCount = (...values: unknown[]): number | null => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
};

export default function PostDetails() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { postDetails, setPostDetails } = usePostStore();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get("id");

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<any | null>(postDetails);
  const [hasUpvoted, setHasUpvoted] = useState(
    Boolean(postDetails?.isUpvoted ?? postDetails?.upvoted),
  );


  // Modals state
  const [analyzingModalOpen, setAnalyzingModalOpen] = useState(false);
  const [analyzingModalStatus, setAnalyzingModalStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [aiDetection, setAiDetection] = useState<any>(undefined);
  const [humanDetection, setHumanDetection] = useState<any>(undefined);
  const [editingDetection, setEditingDetection] = useState<any>(undefined);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const { data: fetchedPostData, isLoading: isFetchingPost, error: fetchError } = useQuery({
    queryKey: ["post", postIdFromUrl],
    queryFn: () => getPostApi(postIdFromUrl!),
    enabled: !!postIdFromUrl,
  });

  const postToDisplay = fetchedPostData?.data?.data || fetchedPostData?.data || postDetails;

  const currentPostId = getEntityId(postToDisplay);
  const currentUserId = getEntityId(user);
  const postOwnerId = getEntityId(postToDisplay?.createdBy);
  const canDeletePost =
    Boolean(currentUserId) &&
    Boolean(postOwnerId) &&
    currentUserId === postOwnerId;

  const imageUrl = postToDisplay?.media?.location || FALLBACK_POST_IMAGE;
  const authorImage =
    postToDisplay?.createdBy?.profilePicture?.location ||
    postToDisplay?.createdBy?.profilePicture ||
    FALLBACK_AVATAR;
  const locationText =
    [postToDisplay?.state, postToDisplay?.country].filter(Boolean).join(", ") ||
    "Location unavailable";

  // Fetch related posts
  const { data: relatedPostsData, isLoading: isLoadingRelated } = useQuery({
    queryKey: ["related-posts", postToDisplay?._id, postToDisplay?.categories],
    queryFn: () =>
      getAllPostsApi({
        categories: postToDisplay?.categories?.map((c: any) => c._id || c.id) || [],
      }),
    enabled: !!postToDisplay,
    refetchOnMount: "always", // Ensure fresh data on every mount/reload
    staleTime: 0,
  });

  const relatedPosts = (relatedPostsData?.data?.data || relatedPostsData?.data || []).filter(
    (p: any) => (p._id || p.id) !== currentPostId
  );

  const { mutate: updateRejectedImage, isPending: isUpdatingImage } =
    useMutation({
      mutationFn: ({
        postId,
        formData,
      }: {
        postId: string;
        formData: FormData;
      }) => updatePostApi(postId, formData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["post", currentPostId] });
        setAnalyzingModalOpen(false);
        showToast("Image updated successfully!");
      },
      onError: (err) => {
        console.error("Failed to update image", err);
        showToast("Failed to update image", "error");
      },
    });

  useEffect(() => {
    if (postToDisplay) {
      setCurrentPost(postToDisplay);
      setHasUpvoted(Boolean(postToDisplay?.isUpvoted ?? postToDisplay?.upvoted));

      // Handle status-based modals only when not fetching fresh data
      // This prevents list-view partial data from triggering modals prematurely
      if (!isFetchingPost) {
        const status = postToDisplay.status?.toLowerCase();
        if (status === "rejected") {
          setRejectionReason(postToDisplay.reason || postToDisplay.rejectionReason || "Your post was rejected by our AI verification system.");
          setAiDetection(postToDisplay.aiDetection);
          setHumanDetection(postToDisplay.humanDetection);
          setEditingDetection(postToDisplay.editingDetection);

          const aiIssue = postToDisplay.aiDetection?.isAI === true;
          const humanIssue = postToDisplay.humanDetection?.hasHuman === false;
          const editingIssue = postToDisplay.editingDetection?.isEdited === true;

          setAnalyzingModalStatus(aiIssue || humanIssue || editingIssue ? "error" : "success");
          setAnalyzingModalOpen(true);
        } else if ((status === "approved" || status === "completed") && !postToDisplay.country) {
          setEditingPost(postToDisplay);
        }
      }
    }
  }, [postToDisplay, isFetchingPost]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentPostId) {
      const formData = new FormData();
      formData.append("media", file);
      updateRejectedImage({ postId: currentPostId, formData });
    }
  };
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    type: "success",
  });



  const showToast = (message: string, type: ToastState["type"] = "success") => {
    setToast({ open: true, message, type });
  };

  const syncPost = (updater: (previousPost: any | null) => any | null) => {
    setCurrentPost((previousPost: any | null) => {
      const nextPost = updater(previousPost);
      setPostDetails(nextPost);
      return nextPost;
    });
  };

  const invalidatePostLists = () => {
    queryClient.invalidateQueries({ queryKey: ["ownPosts"] });
    queryClient.invalidateQueries({ queryKey: ["for-you-feed"] });
    queryClient.invalidateQueries({ queryKey: ["featured-feed"] });
  };


  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: (postId: string) => deletePostApi(postId),
    onSuccess: () => {
      invalidatePostLists();
      setDeletingPostId(null);
      setPostDetails(null);
      showToast("Post deleted successfully.");
      router.push("/Profile");
    },
    onError: (error) => {
      showToast(getApiErrorMessage(error), "error");
    },
  });

  const { mutate: upvotePost, isPending: isUpvoting } = useMutation({
    mutationFn: (postId: string) => upvotePostApi(postId),
    onSuccess: (response) => {
      const updatedPost = response?.data ?? response;
      syncPost((previousPost) => {
        if (!previousPost) return previousPost;

        const nextUpvoteCount = getReturnedCount(
          updatedPost?.upvotes,
          updatedPost?.data?.upvotes,
        );

        return {
          ...previousPost,
          upvotes: nextUpvoteCount ?? getSafeCount(previousPost?.upvotes) + 1,
          isUpvoted: true,
          upvoted: true,
        };
      });
      setHasUpvoted(true);
      invalidatePostLists();
      showToast("Post upvoted successfully.");
    },
    onError: (error) => {
      showToast(getApiErrorMessage(error), "error");
    },
  });

  const { mutate: downloadPost, isPending: isDownloading } = useMutation({
    mutationFn: (postId: string) => downloadPostApi(postId),
    onSuccess: async (response) => {
      try {
        const fileUrl = response?.data?.filePath;
        const fileName = response?.data?.fileName;

        if (!fileUrl) throw new Error("File URL missing");

        const responseBlob = await fetch(fileUrl);
        const blob = await responseBlob.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName || "download";

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
        showToast("Download started.");
      } catch (error) {
        showToast(getApiErrorMessage(error), "error");
      }
    },
    onError: (error) => {
      showToast(getApiErrorMessage(error), "error");
    },
  });

  const handleConfirmDelete = () => {
    if (!deletingPostId) return;
    if (!canDeletePost) {
      setDeletingPostId(null);
      showToast("You can only delete your own post.", "error");
      return;
    }

    deletePost(deletingPostId);
  };

  if (isFetchingPost) {
    return (
      <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium whitespace-nowrap">Loading post details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPost && !isFetchingPost) {
    return (
      <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
        <Header />
        <Toast
          open={toast.open}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((previous) => ({ ...previous, open: false }))}
        />
        <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">No post selected</h2>
          <p className="mt-3 text-sm text-gray-500">
            Open a post from the listing first, then its details will appear
            here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      <Header />
      {/* Toaster */}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((previous) => ({ ...previous, open: false }))}
      />

      <div className="grid grid-cols-1 mt-8 p-4 pt-0 lg:grid-cols-[420px_1fr] gap-5 max-w-[1500px] mx-auto">
        <div className="flex flex-col gap-4">
          <div className="relative h-[540px] rounded-[32px] overflow-hidden shadow-xl">
            <Image
              src={imageUrl}
              alt={currentPost?.caption || "Post image"}
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
            <div className="flex items-center justify-between mb-1 gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentPost?.caption || "Untitled post"}
              </h2>
              <div className="flex items-center gap-1 text-gray-800 shrink-0">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-semibold">{locationText}</span>
              </div>
            </div>

            <p className="text-sm flex gap-2 text-gray-400 mb-6">
              {
                currentPost?.categories?.map((category: any) => (
                  <span
                    key={category?.id}
                    className="px-4 py-1.5 rounded-full text-xs font-bold gradient-bg text-white border-none shadow-md"
                  >
                    {category?.name}
                  </span>
                ))
              }
            </p>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 min-w-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={authorImage}
                    alt={currentPost?.createdBy?.name || "Author"}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-md font-bold text-gray-900 truncate">
                  {currentPost?.createdBy?.name || "Unknown user"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!currentPostId || isUpvoting || hasUpvoted}
                  onClick={() => currentPostId && upvotePost(currentPostId)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-[1.5px] transition ${hasUpvoted
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-blue-500 text-blue-500 hover:bg-blue-50"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <ArrowBigUpDash className="w-5 h-5 fill-current" />
                  <span className="font-bold">
                    {getSafeCount(currentPost?.upvotes)}
                  </span>
                </button>

                {canDeletePost && (
                  <button
                    type="button"
                    onClick={() => setIsInsightsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border-[1.5px] border-blue-500 text-blue-500 hover:bg-blue-50 transition"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-bold"></span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={!currentPostId || isDownloading}
                  onClick={() => currentPostId && downloadPost(currentPostId)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-600 transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-bold">
                    {getSafeCount(currentPost?.downloads)}
                  </span>
                </button>


                <button
                  type="button"
                  onClick={() => setIsSaveOpen(true)}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-600 transition"
                >
                  <EllipsisVertical className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-6">
            More related to explore!
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 auto-rows-[120px] gap-6">
            {isLoadingRelated ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`bg-gray-100 animate-pulse rounded-[28px] ${i % 3 === 0 || i % 2 === 0 ? "row-span-3" : "row-span-2"
                    }`}
                />
              ))
            ) : relatedPosts.length > 0 ? (
              relatedPosts.map((post: any, i: number) => {
                const isTall = i % 3 === 0 || i % 2 === 0;
                const relatedPostId = post._id || post.id;
                const relatedImageUrl = post.media?.location || FALLBACK_POST_IMAGE;

                return (
                  <div
                    key={relatedPostId || i}
                    onClick={() => router.push(`/postdetails?id=${relatedPostId}`)}
                    className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl hover:shadow-2xl transition cursor-pointer group ${isTall ? "row-span-3" : "row-span-2"
                      }`}
                  >
                    <Image
                      src={relatedImageUrl}
                      alt={post.caption || "Related Post"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-xs font-medium truncate w-full">
                        {post.caption}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center text-gray-500">
                No related posts found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup */}
      <SaveModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        onDelete={() => setDeletingPostId(currentPostId)}
        showDeleteOption={canDeletePost}
        post={currentPost}
      />

      <DeleteConfirmModal
        isOpen={!!deletingPostId}
        isPending={isDeleting}
        onClose={() => setDeletingPostId(null)}
        onConfirm={handleConfirmDelete}
      />

      <AnalyzingModal
        isOpen={analyzingModalOpen}
        status={analyzingModalStatus}
        reason={rejectionReason}
        aiDetection={aiDetection}
        humanDetection={humanDetection}
        editingDetection={editingDetection}
        onClose={() => {
          setAnalyzingModalOpen(false);
          setAnalyzingModalStatus("idle");
        }}
        onChangeImage={() => hiddenFileInputRef.current?.click()}
        setIsImage={() => { }}
      />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={hiddenFileInputRef}
        onChange={handleImageChange}
      />

      <EditPostModal
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["post", currentPostId] });
          showToast("Post updated successfully!");
        }}
      />

      <InsightsModal
        postId={currentPostId || ""}
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
      />
    </div>
  );
}
