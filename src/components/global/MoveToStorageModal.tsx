"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFoldersApi, movePostToFolderApi, FolderItem } from "@/services/frameApi";
import { Loader2, X, Check } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";

interface MoveToStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onSuccess?: () => void;
}

const MoveToStorageModal: React.FC<MoveToStorageModalProps> = ({
  isOpen,
  onClose,
  postId,
  onSuccess,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const queryClient = useQueryClient();

  // Fetch folders
  const { 
    data: foldersData, 
    isLoading: isLoadingFolders, 
    isError: isFoldersError,
    refetch: refetchFolders
  } = useQuery({
    queryKey: ["personalFoldersMove"],
    queryFn: () => getFoldersApi({ page: 1, limit: 100 }),
    enabled: isOpen,
  });

  const folders = foldersData?.data || [];

  // Move post mutation
  const { mutate: movePost, isPending: isMoving } = useMutation({
    mutationFn: (folderId: string) => movePostToFolderApi(folderId, postId),
    onSuccess: () => {
      toast.success("Post moved to personal storage successfully");
      queryClient.invalidateQueries({ queryKey: ["personalFolders"] });
      queryClient.invalidateQueries({ queryKey: ["personalFoldersMove"] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to move post");
    },
  });

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">Select Folder</h2>
          <button 
            disabled={isMoving}
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isLoadingFolders ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-gray-500 text-sm">Loading folders...</p>
            </div>
          ) : isFoldersError ? (
            <div className="text-center py-10">
              <p className="text-red-500 text-sm mb-4">Failed to load folders</p>
              <button 
                onClick={() => refetchFolders()}
                className="px-4 py-2 bg-blue-500 text-white text-xs rounded-full"
              >
                Retry
              </button>
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No folders available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {folders.map((folder) => {
                const isSelected = selectedFolder?._id === folder._id;
                return (
                  <button
                    key={folder._id}
                    onClick={() => setSelectedFolder(folder)}
                    disabled={isMoving}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                      isSelected 
                        ? "bg-blue-50 border-blue-200" 
                        : "bg-white border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">{folder.name}</p>
                        <p className="text-[11px] text-gray-400">{folder.noOfImages || 0} images</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0">
          <button 
            disabled={isMoving}
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-semibold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            disabled={!selectedFolder || isMoving}
            onClick={() => movePost(selectedFolder!._id)}
            className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isMoving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Moving...
              </>
            ) : (
              "Move Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MoveToStorageModal;
