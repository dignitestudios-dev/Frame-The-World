"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Hash, Plus, Bookmark, Contact2, Trash, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getOwnFramesApi, addPostToFrameApi } from "@/services/frameApi";

type ModalState = "menu" | "frames" | "storage" | "success_frame" | "success_storage" | "delete";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  showDeleteOption?: boolean;
  post?: any;
}



const SaveModal = ({
  isOpen,
  onClose,
  onDelete,
  showDeleteOption = true,
  post,
}: SaveModalProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ModalState>("menu");
  const [selectedFrameTitle, setSelectedFrameTitle] = useState("");
  const [selectedFrameId, setSelectedFrameId] = useState("");
  // Fetch real frames
  const { data: ownFramesData, isLoading: isLoadingFrames } = useQuery({
    queryKey: ["ownFrames"],
    queryFn: () => getOwnFramesApi({ page: 1, limit: 50 }),
    enabled: isOpen && view === "frames",
  });

  const ownFrames = ownFramesData?.data?.data || ownFramesData?.data || [];

  // Save to Frame Mutation
  const { mutate: saveToFrame, isPending: isSaving } = useMutation({
    mutationFn: async (frame: any) => {
      setSelectedFrameTitle(frame.title || "Frame");
      const frameId = frame._id || frame.id;
      setSelectedFrameId(frameId)
      const postId = post?.id || post?._id || "";

      if (!frameId || !postId) {
        throw new Error("Missing frameId or postId");
      }

      return addPostToFrameApi(frameId, postId);
    },
    onSuccess: () => {
      setView("success_frame");
      queryClient.invalidateQueries({ queryKey: ["ownFrames"] });
    },
    onError: (error) => {
      console.error("Save to frame failed:", error);
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setView("menu");
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const privateFolders = [
    { id: 1, title: "Private 1", img: "https://picsum.photos/id/105/100" },
    { id: 2, title: "Private 2", img: "https://picsum.photos/id/106/100" },
    { id: 3, title: "Private 3", img: "https://picsum.photos/id/107/100" },
    { id: 4, title: "Private 4", img: "https://picsum.photos/id/108/100" },
  ];

  const renderHeader = (title: string, showBack = true) => (
    <div className="relative h-28 flex items-end justify-center pb-6 bg-blue-100">
      {showBack && (
        <button
          onClick={() => setView("menu")}
          className="absolute left-6 bottom-6 p-1 hover:bg-black/5 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}
      <h2 className="text-[22px] font-semibold text-gray-800">{title}</h2>
    </div>
  );

  const ListItem = ({ title, img, locked, onClick, isPending, id }: any) => (
    <button
      onClick={onClick}
      disabled={isPending}
      className={`flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-gray-200 rounded-lg translate-x-1 -translate-y-1 rotate-2" />
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white shadow-sm bg-gray-100">
            {img ? (
              <img src={img} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Hash className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
        <span className="text-[15px] font-bold text-gray-800 line-clamp-1 text-left">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {isPending && selectedFrameId == id && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        {locked && <span className="text-xl">🔒</span>}
      </div>
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[380px] h-auto bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* VIEW: MAIN MENU */}
        {view === "menu" && (
          <div className="pb-8">
            {renderHeader("Options", false)}
            <div className="px-4 space-y-2">
              <button onClick={() => setView("frames")} className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 rounded-2xl group transition-all">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Hash className="w-6 h-6" /></div>
                <div className="text-left"><p className="font-bold text-gray-900 leading-tight">Save to Frames</p><p className="text-xs text-gray-400">Move picture to a frame.</p></div>
              </button>
              <button
                onClick={() => {
                  const postId = post?.id || post?._id;
                  router.push(`/CreateFrames${postId ? `?postId=${postId}` : ""}`);
                }}
                className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 rounded-2xl group transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Plus className="w-6 h-6" /></div>
                <div className="text-left"><p className="font-bold text-gray-900 leading-tight">Create New Frame & Add</p><p className="text-xs text-gray-400">Start a new frame for this memory.</p></div>
              </button>
              <button onClick={() => setView("storage")} className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 rounded-2xl group transition-all">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Contact2 className="w-6 h-6" /></div>
                <div className="text-left"><p className="font-bold text-gray-900 leading-tight">Save to Personal Storage</p><p className="text-xs text-gray-400">Save before posting.</p></div>
              </button>
              {showDeleteOption ? (
                <button onClick={() => { onDelete?.(); onClose(); }} className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 rounded-2xl group transition-all">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Trash className="w-6 h-6" /></div>
                  <div className="text-left"><p className="font-bold text-gray-900 leading-tight">Delete Post</p><p className="text-xs text-gray-400">Remove from app permanently.</p></div>
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* VIEW: FRAMES LIST */}
        {view === "frames" && (
          <div className="pb-6">
            {renderHeader("Frames")}
            <div className="max-h-[500px] overflow-y-auto scrollbar-hidden">
              {isLoadingFrames ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-xs text-gray-400 font-medium">Loading your frames...</p>
                </div>
              ) : ownFrames.length === 0 ? (
                <div className="flex flex-col items-center py-10 px-10 text-center gap-2">
                  <p className="font-bold text-gray-800">No frames found</p>
                  <p className="text-xs text-gray-400">Create a new frame to save this post.</p>
                </div>
              ) : (
                ownFrames.map((f: any) => (
                  <ListItem
                    id={f._id || f.id}
                    key={f._id || f.id}
                    title={f.title}
                    img={f.cover?.location || f.cover}
                    locked={f.isPrivate}
                    isPending={isSaving}
                    onClick={() => !isSaving && saveToFrame(f)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW: STORAGE LIST */}
        {view === "storage" && (
          <div className="pb-6">
            {renderHeader("Private Storage Folders")}
            <div className="max-h-[500px] overflow-y-auto">
              {privateFolders.map(f => <ListItem key={f.id} {...f} onClick={() => setView("success_storage")} />)}
            </div>
          </div>
        )}

        {/* VIEW: SUCCESS STATES */}
        {(view === "success_frame" || view === "success_storage") && (
          <div className="pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-40 bg-blue-100 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#96AFFF] border-4 border-white shadow-lg flex items-center justify-center text-white">
                <Bookmark className="w-10 h-10 fill-current" />
              </div>
            </div>
            <div className="text-center px-8 space-y-2 mt-4 pb-4">
              <h2 className="text-3xl font-bold text-gray-900">Successfully Saved</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {view === "success_frame"
                  ? `Picture has been successfully saved to the ${selectedFrameTitle} frame`
                  : "Your picture has been successfully saved to the Personal Storage"}
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

export default SaveModal;
