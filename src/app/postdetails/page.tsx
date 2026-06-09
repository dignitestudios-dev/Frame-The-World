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
  ArrowUp,
  Layers,
  Loader2,
} from "lucide-react";
import Header from "@/components/global/header";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import SaveModal from "@/components/global/SaveModal";
import { usePostStore } from "@/store/PostStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePostApi,
  downloadPostApi,
  upvotePostApi,
  getPostApi,
  updatePostApi,
  getSearchPostsApi,
} from "@/services/postApi";
import AnalyzingModal from "@/components/createpost/AnalyzingModalProps";
import EditPostModal from "@/components/profile/EditPostModal";
import DeleteConfirmModal from "@/components/profile/DeleteConfirmModal";
import InsightsModal from "@/components/post/InsightsModal";
import { useAuthStore } from "@/store/authStore";
import ReportModal from "@/components/global/ReportModal";
import { useAccessControl } from "@/providers/AccessControlProvider";
import { getApiErrorMessage, isTrialLimitError } from "@/lib/apiError";
import TrialLimitModal from "@/components/global/TrialLimitModal";
import { Toast } from "@/components/ui/toast";
import { useQuery as useInsightsQuery } from "@tanstack/react-query";
import { getPostInsightsApi } from "@/services/postApi";
import OwnPostView from "./OwnPostView";

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

// ─── Timeframes for insights ────────────────────────────────────────────────
const MAX_REUPLOAD_IMAGE_FILE_SIZE_BYTES = 15 * 1024 * 1024;

const TIMEFRAMES = [
  { id: "24h", label: "24h" },
  { id: "week", label: "Week" },
  { id: "month", label: "Monthly" },
  { id: "year", label: "Year" },
];


function PostDetailsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { postDetails, setPostDetails } = usePostStore();
  const { executeWithCheck } = useAccessControl();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get("id");

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<any | null>(postDetails);
  const [hasUpvoted, setHasUpvoted] = useState(
    Boolean(postDetails?.isUpvoted ?? postDetails?.upvoted),
  );

  // This ref prevents API refetch from overwriting local upvote state
  // after the user has manually toggled the upvote button.
  const hasInteracted = useRef(false);
  const hasDownloadInteracted = useRef(false);
  // Always-current upvote count — avoids stale closure reads in onMutate
  const upvoteCountRef = useRef<number>(getSafeCount(postDetails?.upvotes || postDetails?.upvoteCount));
  const downloadCountRef = useRef<number>(getSafeCount(postDetails?.downloads));

  useEffect(() => {
    hasInteracted.current = false;
    hasDownloadInteracted.current = false;
  }, [postIdFromUrl]);

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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTrialLimitModalOpen, setIsTrialLimitModalOpen] = useState(false);
  const [trialLimitMessage, setTrialLimitMessage] = useState<string | undefined>();
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: ToastState["type"] = "success") => {
    setToast({ open: true, message, type });
  };

  const handleTrialOrGenericError = (error: unknown) => {
    if (isTrialLimitError(error)) {
      setTrialLimitMessage(getApiErrorMessage(error));
      setIsTrialLimitModalOpen(true);
      return;
    }
    showToast(getApiErrorMessage(error), "error");
  };

  const trialLimitModal = (
    <TrialLimitModal
      isOpen={isTrialLimitModalOpen}
      onClose={() => {
        setIsTrialLimitModalOpen(false);
        setTrialLimitMessage(undefined);
      }}
      description={trialLimitMessage}
    />
  );

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
      getSearchPostsApi({
        categories: postToDisplay?.categories?.map((c: any) => c._id || c.id) || [],
      }),
    enabled: !!postToDisplay,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const relatedPosts = (relatedPostsData?.data || []).filter(
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

  const syncPost = (updater: (previousPost: any | null) => any | null) => {
    setCurrentPost((previousPost: any | null) => {
      const nextPost = updater(previousPost);
      setTimeout(() => setPostDetails(nextPost), 0);
      return nextPost;
    });
  };

  const invalidatePostLists = () => {
    queryClient.invalidateQueries({ queryKey: ["ownPosts"] });
    queryClient.invalidateQueries({ queryKey: ["for-you-feed"] });
    queryClient.invalidateQueries({ queryKey: ["featured-feed"] });
  };

  const patchInsightsDownloads = (downloads: number) => {
    if (!currentPostId) return;
    queryClient.setQueriesData(
      { queryKey: ["postInsights", currentPostId] },
      (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const root = old as Record<string, unknown>;
        const dataLayer = root.data as Record<string, unknown> | undefined;
        const summary =
          (dataLayer?.summary as Record<string, unknown> | undefined) ??
          (root.summary as Record<string, unknown> | undefined);
        if (!summary) return old;
        const nextSummary = { ...summary, downloads };
        if (dataLayer?.summary) {
          return { ...root, data: { ...dataLayer, summary: nextSummary } };
        }
        return { ...root, summary: nextSummary };
      }
    );
  };

  const applyDownloadCount = (downloads: number) => {
    hasDownloadInteracted.current = true;
    downloadCountRef.current = downloads;
    syncPost((prev) => (prev ? { ...prev, downloads } : prev));
    patchInsightsDownloads(downloads);

    if (!postIdFromUrl) return;

    queryClient.setQueryData(["post", postIdFromUrl], (old: any) => {
      if (!old) return old;
      const post = old?.data?.data ?? old?.data ?? old;
      if (old?.data?.data) {
        return {
          ...old,
          data: {
            ...old.data,
            data: { ...post, downloads },
          },
        };
      }
      if (old?.data) {
        return { ...old, data: { ...post, downloads } };
      }
      return { ...post, downloads };
    });
  };

  const { mutate: upvotePost, isPending: isUpvoting } = useMutation({
    mutationFn: ({ postId, upvote }: { postId: string; upvote: boolean }) =>
      upvotePostApi(postId, { upvote }),
    onMutate: ({ upvote }) => {
      hasInteracted.current = true;
      // Read from ref (never stale) and update immediately
      const prevUpvoted = hasUpvoted;
      const prevCount = upvoteCountRef.current;
      const newCount = upvote ? prevCount + 1 : Math.max(0, prevCount - 1);
      upvoteCountRef.current = newCount; // update ref before next render
      setHasUpvoted(upvote);
      setCurrentPost((prev: any) =>
        prev ? { ...prev, upvotes: newCount, isUpvoted: upvote, upvoted: upvote } : prev
      );
      return { prevUpvoted, prevCount };
    },
    onSuccess: (response, variables) => {
      const updatedPost = response?.data ?? response;
      const isUpvotedAction = variables.upvote;
      // Only trust the API count if it's a real positive number.
      // API sometimes returns 0 which is misleading — prefer our optimistic count.
      const apiCount = getReturnedCount(
        updatedPost?.upvotes,
        updatedPost?.data?.upvotes,
      );
      if (apiCount !== null && apiCount > 0) {
        upvoteCountRef.current = apiCount;
        setCurrentPost((prev: any) =>
          prev ? { ...prev, upvotes: apiCount, isUpvoted: isUpvotedAction, upvoted: isUpvotedAction } : prev
        );
      } else {
        // Keep the optimistic count already set in onMutate
        setCurrentPost((prev: any) =>
          prev ? { ...prev, isUpvoted: isUpvotedAction, upvoted: isUpvotedAction } : prev
        );
      }
      setHasUpvoted(isUpvotedAction);
      invalidatePostLists();
      showToast(isUpvotedAction ? "Post upvoted successfully." : "Post unvoted successfully.");
    },
    onError: (error, _variables, context: any) => {
      hasInteracted.current = false;
      if (context) {
        upvoteCountRef.current = context.prevCount;
        setHasUpvoted(context.prevUpvoted);
        setCurrentPost((prev: any) =>
          prev
            ? { ...prev, upvotes: context.prevCount, isUpvoted: context.prevUpvoted, upvoted: context.prevUpvoted }
            : prev
        );
      }
      showToast(getApiErrorMessage(error), "error");
    },
  });

  useEffect(() => {
    if (postToDisplay && !isUpvoting) {
      if (!hasInteracted.current && !hasDownloadInteracted.current) {
        setCurrentPost(postToDisplay);
        setHasUpvoted(Boolean(postToDisplay?.isUpvoted ?? postToDisplay?.upvoted));
        upvoteCountRef.current = getSafeCount(postToDisplay?.upvotes || postToDisplay?.upvoteCount);
        downloadCountRef.current = getSafeCount(postToDisplay?.downloads);
      } else if (!hasInteracted.current) {
        setCurrentPost((prev: any) =>
          prev
            ? { ...postToDisplay, downloads: downloadCountRef.current }
            : postToDisplay
        );
        setHasUpvoted(Boolean(postToDisplay?.isUpvoted ?? postToDisplay?.upvoted));
        upvoteCountRef.current = getSafeCount(postToDisplay?.upvotes || postToDisplay?.upvoteCount);
      } else if (!hasDownloadInteracted.current) {
        setCurrentPost((prev: any) =>
          prev
            ? {
                ...postToDisplay,
                upvotes: upvoteCountRef.current,
                isUpvoted: hasUpvoted,
                upvoted: hasUpvoted,
              }
            : postToDisplay
        );
        downloadCountRef.current = getSafeCount(postToDisplay?.downloads);
      }

      if (!isFetchingPost) {
        const status = postToDisplay.status?.toLowerCase();
        if (status === "rejected") {
          setRejectionReason(
            postToDisplay.reason ||
            postToDisplay.rejectionReason ||
            "Your post was rejected by our AI verification system.",
          );
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
  }, [postToDisplay, isFetchingPost, isUpvoting]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentPostId) {
      if (file.size > MAX_REUPLOAD_IMAGE_FILE_SIZE_BYTES) {
        showToast("Image must be 15MB or smaller.", "error");
        e.target.value = "";
        return;
      }
      const formData = new FormData();
      formData.append("media", file);
      updateRejectedImage({ postId: currentPostId, formData });
    }
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

  const { mutate: downloadPost, isPending: isDownloading } = useMutation({
    mutationFn: (postId: string) => downloadPostApi(postId),
    onSuccess: async (response) => {
      const updatedPost = response?.data ?? response;
      const apiCount = getReturnedCount(
        updatedPost?.downloads,
        updatedPost?.data?.downloads,
        response?.downloads,
      );
      const newCount =
        apiCount !== null ? apiCount : downloadCountRef.current + 1;
      applyDownloadCount(newCount);
      invalidatePostLists();
      queryClient.invalidateQueries({ queryKey: ["postInsights", currentPostId] });

      try {
        let fileUrl = response?.data?.filePath;
        fileUrl = `${fileUrl}${fileUrl.includes("?") ? "&" : "?"}t=${new Date().getTime()}`;
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
      handleTrialOrGenericError(error);
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
        <Header title="Today's Travel Story" subtitle={``} />
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
        <Header title="Today's Travel Story" />
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
            Open a post from the listing first, then its details will appear here.
          </p>
        </div>
      </div>
    );
  }

  // --- Own Post View (owner layout) ---
  if (canDeletePost) {
    return (
      <>
        {trialLimitModal}
        <OwnPostView
        currentPost={currentPost}
        currentPostId={currentPostId}
        imageUrl={imageUrl}
        locationText={locationText}
        isDownloading={isDownloading}
        onBack={() => router.back()}
        onDownload={() =>
          executeWithCheck(() => {
            if (currentPostId) downloadPost(currentPostId);
          })
        }
        onSave={() => setIsSaveOpen(true)}
        onDeleteClick={() => setDeletingPostId(currentPostId)}
        toast={toast}
        setToast={setToast}
        isSaveOpen={isSaveOpen}
        setIsSaveOpen={setIsSaveOpen}
        deletingPostId={deletingPostId}
        setDeletingPostId={setDeletingPostId}
        handleDeleteConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        editingPost={editingPost}
        setEditingPost={setEditingPost}
        queryClient={queryClient}
        showToast={showToast}
        analyzingModalOpen={analyzingModalOpen}
        setAnalyzingModalOpen={setAnalyzingModalOpen}
        analyzingModalStatus={analyzingModalStatus}
        rejectionReason={rejectionReason}
        aiDetection={aiDetection}
        humanDetection={humanDetection}
        editingDetection={editingDetection}
        hiddenFileInputRef={hiddenFileInputRef}
        handleImageChange={handleImageChange}
        isUpdatingImage={isUpdatingImage}
        getSafeCount={getSafeCount}
      />
      </>
    );
  }

  // --- Other User's Post View ---
  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      {trialLimitModal}
      <Header
        title="Today's Travel Story"
        subtitle={`${relatedPosts?.length}+ new memories for you`}
      />

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
              <h2 className="text-[20px] mb-7 font-bold text-gray-900">
                {currentPost?.caption || "Untitled post"}
              </h2>
              <div className="flex items-center gap-1 text-gray-800 shrink-0">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-semibold">{locationText}</span>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {currentPost?.categories?.map((category: any) => (
                <span
                  key={category?.id}
                  className="rounded-full border-none px-4 py-1.5 text-xs font-bold text-white shadow-md gradient-bg"
                >
                  {category?.name}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    const authorId = getEntityId(currentPost?.createdBy);
                    if (authorId) router.push(`/Profile/${authorId}`);
                  }}
                >
                  <Image
                    src={authorImage}
                    alt={currentPost?.createdBy?.name || "Author"}
                    fill
                    className="object-cover"
                  />
                </div>
                <span
                  className="text-md font-bold text-gray-900 truncate cursor-pointer hover:underline underline-offset-2"
                  onClick={() => {
                    const authorId = getEntityId(currentPost?.createdBy);
                    if (authorId) router.push(`/Profile/${authorId}`);
                  }}
                >
                  {currentPost?.createdBy?.name || "Unknown user"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!canDeletePost && (
                  <button
                    type="button"
                    disabled={!currentPostId || isUpvoting}
                    onClick={() =>
                      executeWithCheck(() => {
                        if (currentPostId) upvotePost({ postId: currentPostId, upvote: !hasUpvoted });
                      })
                    }
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-[1.5px] transition ${hasUpvoted
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-blue-500 text-blue-500 bg-transparent"
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <ArrowBigUpDash className="w-5 h-5 fill-current" />
                    <span className="font-bold">
                      {getSafeCount(currentPost?.upvotes)}
                    </span>
                  </button>
                )}

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
                  onClick={() => executeWithCheck(() => { if (currentPostId) downloadPost(currentPostId) })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-600 transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-bold">
                    {getSafeCount(currentPost?.downloads)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => executeWithCheck(() => setIsSaveOpen(true))}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-600 transition"
                >
                  <EllipsisVertical className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-6">More related to explore!</h3>

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

      {/* Modals */}
      <SaveModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        onDelete={() => setDeletingPostId(currentPostId)}
        showDeleteOption={canDeletePost}
        onReport={() => setIsReportModalOpen(true)}
        showReportOption={!canDeletePost}
        post={currentPost}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        entityId={currentPost?.createdBy?._id || ""}
        entityType="User"
        supportingEntityId={currentPostId || ""}
        supportingEntityType="Post"
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
        postId={postIdFromUrl || currentPostId || undefined}
        imageUrl={imageUrl}
        onClose={() => {
          router.push("/Profile")
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

export default function PostDetails() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen backdrop-blur-3xl bg-blur-15 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PostDetailsContent />
    </Suspense>
  );
}