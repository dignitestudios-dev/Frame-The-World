"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/global/header";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { removeHumanApi, confirmRemoveHumanApi, getPostApi } from "@/services/postApi";


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

  const postId = searchParams.get("postId") || "";

  // Fetch post data directly — reliable even if URL param was lost
  const { data: postData, isLoading: isLoadingPost } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostApi(postId),
    enabled: !!postId,
    staleTime: 0,
  });

  const postImageUrl =
    postData?.data?.media?.location ||
    postData?.media?.location ||
    postData?.data?.media?.url ||
    postData?.media?.url ||
    "";

  // ui state
  const [phase, setPhase] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [removedFileId, setRemovedFileId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // auto-redirect after done
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
  }, []);

  // ── Step 1: Remove Human ──────────────────────────────────────────────────
  const { mutate: removeHuman, isPending: isRemoving } = useMutation({
    mutationFn: () => removeHumanApi(postId),
    onSuccess: (res) => {
      const fileId = res?.data?._id || res?.data?.id || res?._id || res?.id;
      const newUrl =
        res?.data?.location ||
        res?.data?.url ||
        res?.location ||
        res?.url ||
        null;

      setRemovedFileId(fileId || null);
      if (newUrl) setResultImageUrl(newUrl);
      setPhase("done");

      // auto-confirm + redirect
      if (fileId) {
        confirmRemoval(fileId);
      } else {
        // no file to confirm — just go back to profile
        doneTimerRef.current = setTimeout(() => {
          router.push("/Profile");
        }, 2500);
      }
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Failed to remove human. Please try again.");
      setPhase("error");
    },
  });

  // ── Step 2: Confirm ───────────────────────────────────────────────────────
  const { mutate: confirmRemoval } = useMutation({
    mutationFn: (fileId: string) => confirmRemoveHumanApi(postId, fileId),
    onSuccess: () => {
      // doneTimerRef.current = setTimeout(() => {
      //   router.push("/Profile");
      // }, 2500);
    },
    onError: () => {
      // Confirm failed — still show the result and redirect
      doneTimerRef.current = setTimeout(() => {
        router.push("/Profile");
      }, 2500);
    },
  });

  const handleRemoveSelection = () => {
    if (!postId) {
      setErrorMsg("Post ID is missing. Please go back and try again.");
      setPhase("error");
      return;
    }
    setPhase("processing");
    removeHuman();
  };

  // ── Current image to display ──────────────────────────────────────────────
  const displayImage = phase === "done" && resultImageUrl ? resultImageUrl : postImageUrl;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header title="Ai Tool" subtitle="" />

      <div className="flex flex-col items-center px-4 py-6 max-w-2xl mx-auto">
        {/* Back button */}
        <div className="w-full mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Instruction text */}
        <p className="text-center text-sm text-gray-600 max-w-sm mb-6 leading-relaxed">
          Select the eraser and highlight on the human in order to remove it
          from the picture once the object is erased you can continue to
          reverify your image!
        </p>

        {/* Card */}
        <div className="w-full max-w-[360px] bg-white rounded-[28px] shadow-xl overflow-hidden border-2 border-dashed border-blue-300">
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800 text-sm">Ai Tool</span>         
          </div>

          {/* Image area */}
          <div className="relative">
            {/* Loading skeleton while fetching post data */}
            {isLoadingPost && (
              <div className="w-full animate-pulse bg-gray-200" style={{ minHeight: 340 }}>
                <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 340 }}>
                  <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                </div>
              </div>
            )}

            {/* Main image */}
            {!isLoadingPost && (
              <img
                src={displayImage}
                alt="Post"
                className="w-full object-cover transition-all duration-700"
                style={{ minHeight: 300, maxHeight: 420 }}
              />
            )}

            {/* Slash animation — only while processing (first ~1.5 s) */}
            {phase === "processing" && <SlashOverlay />}

            {/* Spinner — while API is in flight */}
            {phase === "processing" && isRemoving && <SpinnerOverlay />}

            {/* Success glow overlay */}
            {phase === "done" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 z-10 animate-in fade-in duration-500">
                <div className="w-14 h-14 rounded-full bg-green-400/90 flex items-center justify-center shadow-lg mb-2">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white font-bold text-sm">Human removed!</p>
                <p className="text-white/80 text-xs mt-1">Redirecting to profile…</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 p-4">
            {phase !== "done" && (
              <button
                onClick={handleRemoveSelection}
                disabled={phase === "processing"}
                className="flex-1 py-3 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                }}
              >
                {phase === "processing" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Remove Selection"
                )}
              </button>
            )}

            {phase === "done" && (
              <>               
                <button
                  onClick={() => router.push("/Profile")}
                  className="flex-1 py-3 rounded-full text-black text-sm font-semibold"
                  style={{
                    background:
                      "linear-gradient(134.74deg, #CBFE8B 3.24%, #81DE76 111.16%)",
                  }}
                >
                  Continue
                </button>
              </>
            )}
          </div>

          {/* Error message */}
          {phase === "error" && (
            <div className="px-4 pb-4">
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
  );
}

// ─── Suspense wrapper (required for useSearchParams) ─────────────────────────
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
