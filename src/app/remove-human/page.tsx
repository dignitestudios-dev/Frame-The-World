"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/global/header";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { removeHumanApi, confirmRemoveHumanApi, getPostApi } from "@/services/postApi";
import { getPostMediaList, PostMediaFile } from "@/lib/postMedia";

// ─── Slash animation (white zig-zag strokes over the image) ──────────────────
function SlashOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <svg
        viewBox="0 0 200 200"
        className="w-3/4 h-3/4 animate-slash-draw"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M140 55 L80 145"
          stroke="white"
          strokeWidth="14"
          strokeLinecap="round"
          className="animate-dash"
          style={{
            strokeDasharray: 200,
            strokeDashoffset: 200,
            animation: "drawStroke 0.7s ease forwards 0.1s",
          }}
        />
        <path
          d="M80 145 L110 100"
          stroke="white"
          strokeWidth="14"
          strokeLinecap="round"
          style={{
            strokeDasharray: 100,
            strokeDashoffset: 100,
            animation: "drawStroke 0.4s ease forwards 0.75s",
          }}
        />
        <path
          d="M110 100 L60 60"
          stroke="white"
          strokeWidth="14"
          strokeLinecap="round"
          style={{
            strokeDasharray: 120,
            strokeDashoffset: 120,
            animation: "drawStroke 0.5s ease forwards 1.1s",
          }}
        />
        <style>{`
          @keyframes drawStroke {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </svg>
    </div>
  );
}

// ─── Spinning ring loader ─────────────────────────────────────────────────────
function SpinnerOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10 rounded-[28px]">
      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
      <p className="text-white font-semibold text-sm tracking-wide">
        Removing human…
      </p>
    </div>
  );
}

// ─── Main page content ────────────────────────────────────────────────────────
function RemoveHumanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const postId = searchParams.get("postId") || "";
  const queryMediaId = searchParams.get("mediaId") || "";

  // Fetch post data directly
  const {
    data: postData,
    isLoading: isLoadingPost,
    refetch: refetchPost,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostApi(postId),
    enabled: !!postId,
    staleTime: 0,
  });

  const post = postData?.data || postData;
  const mediaList = getPostMediaList(post);

  // Identify all flagged images in the post (humanDetection.hasHuman === true)
  const flaggedImages = mediaList.filter(
    (item) => item.type !== "video" && item.humanDetection?.hasHuman === true
  );

  // Pick target flagged image (either by query parameter, or first flagged, or first image)
  const [selectedMediaId, setSelectedMediaId] = useState<string>(queryMediaId);

  useEffect(() => {
    if (!selectedMediaId && flaggedImages.length > 0) {
      const firstId = flaggedImages[0]._id || flaggedImages[0].id || "";
      setSelectedMediaId(firstId);
    }
  }, [flaggedImages, selectedMediaId]);

  const currentMediaItem: PostMediaFile | null =
    mediaList.find((m) => (m._id || m.id) === selectedMediaId) ||
    flaggedImages[0] ||
    mediaList[0] ||
    null;

  const currentMediaId = currentMediaItem?._id || currentMediaItem?.id || "";
  const postImageUrl =
    currentMediaItem?.location ||
    currentMediaItem?.url ||
    searchParams.get("imageUrl") ||
    "";

  // UI state
  const [phase, setPhase] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [hasMoreFlagged, setHasMoreFlagged] = useState<boolean>(false);
  const [remainingCount, setRemainingCount] = useState<number>(0);

  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
  }, []);

  // ── Step 1 & Step 2: Remove Human & Confirm Swap ──────────────────────────
  const { mutate: confirmRemoval } = useMutation({
    mutationFn: ({
      mediaId,
      newFileId,
    }: {
      mediaId: string;
      newFileId: string;
    }) => confirmRemoveHumanApi(postId, mediaId, newFileId),
    onSuccess: (updatedRes) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["ownPosts"] });

      const updatedPost = updatedRes?.data || updatedRes;
      const updatedMediaList = getPostMediaList(updatedPost);
      const remaining = updatedMediaList.filter(
        (m) => m.type !== "video" && m.humanDetection?.hasHuman === true
      );

      setPhase("done");

      if (remaining.length > 0) {
        setHasMoreFlagged(true);
        setRemainingCount(remaining.length);
        // Pre-select next flagged image
        const nextId = remaining[0]._id || remaining[0].id || "";
        setSelectedMediaId(nextId);
      } else {
        setHasMoreFlagged(false);
        doneTimerRef.current = setTimeout(() => {
          router.push("/Profile");
        }, 2500);
      }
    },
    onError: (err: any) => {
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to finalize human removal. Please try again."
      );
      setPhase("error");
    },
  });

  const { mutate: removeHuman, isPending: isRemoving } = useMutation({
    mutationFn: () => removeHumanApi(postId, currentMediaId),
    onSuccess: (res) => {
      const candidateFile = res?.data || res;
      const candidateId = candidateFile?._id || candidateFile?.id;
      const newUrl = candidateFile?.location || candidateFile?.url || null;

      if (newUrl) setResultImageUrl(newUrl);

      if (candidateId && currentMediaId) {
        confirmRemoval({
          mediaId: currentMediaId,
          newFileId: candidateId,
        });
      } else {
        setPhase("done");
        doneTimerRef.current = setTimeout(() => {
          router.push("/Profile");
        }, 2500);
      }
    },
    onError: (err: any) => {
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to remove human. Please try again."
      );
      setPhase("error");
    },
  });

  const handleRemoveSelection = () => {
    if (!postId) {
      setErrorMsg("Post ID is missing. Please go back and try again.");
      setPhase("error");
      return;
    }
    if (!currentMediaId) {
      setErrorMsg("Media file ID is missing. Please reload and try again.");
      setPhase("error");
      return;
    }
    setPhase("processing");
    removeHuman();
  };

  const handleNextFlaggedImage = () => {
    setPhase("idle");
    setResultImageUrl(null);
    setErrorMsg("");
    refetchPost();
  };

  // Current image to display
  const displayImage =
    phase === "done" && resultImageUrl ? resultImageUrl : postImageUrl;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header title="Ai Tool" subtitle="" />

      <div className="flex flex-col items-center px-4 py-6 max-w-2xl mx-auto">
        {/* Back button */}
        <div className="w-full mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Instruction text */}
        <p className="text-center text-sm text-gray-600 max-w-sm mb-4 leading-relaxed">
          Select the eraser and remove humans from your image. Once all flagged
          images are cleared, your post will be verified automatically!
        </p>

        {/* Flagged images indicator if multi-media */}
        {flaggedImages.length > 1 && (
          <div className="mb-4 flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-800">
            <span>
              {flaggedImages.length} images in this post contain humans to remove
            </span>
          </div>
        )}

        {/* Card */}
        <div className="w-full max-w-[380px] bg-white rounded-[28px] shadow-xl overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-center px-5 py-3 border-b border-gray-100">
            <span className="text-center font-bold text-gray-800 text-sm">
              AI Human Removal Tool
            </span>
          </div>

          {/* Image area */}
          <div className="relative">
            {isLoadingPost && (
              <div
                className="w-full animate-pulse bg-gray-200"
                style={{ minHeight: 340 }}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ minHeight: 340 }}
                >
                  <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                </div>
              </div>
            )}

            {!isLoadingPost && displayImage && (
              <div className="relative w-full h-[380px] border-2 border-dashed border-blue-300 rounded-[14px] overflow-hidden bg-black">
                <Image
                  src={displayImage}
                  alt="Flagged image"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-contain transition-all duration-700"
                />
              </div>
            )}

            {/* Slash animation — while processing */}
            {phase === "processing" && <SlashOverlay />}

            {/* Spinner — while API is in flight */}
            {phase === "processing" && isRemoving && <SpinnerOverlay />}

            {/* Success glow overlay */}
            {phase === "done" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 z-10 animate-in fade-in duration-500 rounded-[14px]">
                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg mb-2">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-bold text-sm">Human removed!</p>
                {hasMoreFlagged ? (
                  <p className="text-white/90 text-xs mt-1">
                    {remainingCount} more image(s) require human removal.
                  </p>
                ) : (
                  <p className="text-white/80 text-xs mt-1">
                    All images clean! Redirecting to profile…
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 p-4">
            {phase !== "done" && (
              <button
                onClick={handleRemoveSelection}
                disabled={phase === "processing" || isLoadingPost}
                className="w-full py-3 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                style={{
                  background:
                    "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                }}
              >
                {phase === "processing" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Removal…
                  </>
                ) : (
                  "Remove Human"
                )}
              </button>
            )}

            {phase === "done" && hasMoreFlagged && (
              <button
                onClick={handleNextFlaggedImage}
                className="w-full py-3 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md"
                style={{
                  background:
                    "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                }}
              >
                Fix Next Flagged Image ({remainingCount} left)
              </button>
            )}

            {phase === "done" && !hasMoreFlagged && (
              <button
                onClick={() => router.push("/Profile")}
                className="w-full py-3 rounded-full text-black text-sm font-semibold shadow-md"
                style={{
                  background:
                    "linear-gradient(134.74deg, #CBFE8B 3.24%, #81DE76 111.16%)",
                }}
              >
                Continue to Profile
              </button>
            )}

            {/* Error message */}
            {phase === "error" && (
              <div className="pt-2">
                <p className="text-red-500 text-xs text-center font-medium bg-red-50 rounded-xl p-3">
                  {errorMsg}
                </p>
                <button
                  onClick={() => setPhase("idle")}
                  className="mt-3 w-full py-2 rounded-full text-blue-600 text-sm font-semibold border border-blue-200 hover:bg-blue-50 transition"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RemoveHumanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      }
    >
      <RemoveHumanContent />
    </Suspense>
  );
}
