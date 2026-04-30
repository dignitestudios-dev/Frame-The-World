"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFoldersApi, getFolderImagesApi, FolderItem, FolderImageItem } from "@/services/frameApi";
import { Loader2, X, ChevronLeft, Check } from "lucide-react";
import { createPortal } from "react-dom";

interface ImportFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (image: FolderImageItem) => void;
}

const ImportFolderModal: React.FC<ImportFolderModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<FolderImageItem | null>(null);

  // Fetch folders
  const { 
    data: foldersData, 
    isLoading: isLoadingFolders, 
    isError: isFoldersError,
    refetch: refetchFolders
  } = useQuery({
    queryKey: ["personalFoldersImport"],
    queryFn: () => getFoldersApi({ page: 1, limit: 100 }),
    enabled: isOpen && !selectedFolder,
  });

  // Fetch images in selected folder
  const { 
    data: imagesData, 
    isLoading: isLoadingImages, 
    isError: isImagesError,
    refetch: refetchImages
  } = useQuery({
    queryKey: ["folderImagesImport", selectedFolder?._id],
    queryFn: () => getFolderImagesApi(selectedFolder!._id, { page: 1, limit: 100 }),
    enabled: !!selectedFolder,
  });

  const folders = foldersData?.data || [];
  const images = imagesData?.data || [];

  const handleBackToFolders = () => {
    setSelectedFolder(null);
    setSelectedImage(null);
  };

  const handleImport = () => {
    if (selectedImage) {
      onImport(selectedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {selectedFolder && (
              <button 
                onClick={handleBackToFolders}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {selectedFolder ? selectedFolder.name : "Import from Folder"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {!selectedFolder ? (
            // Folder Grid View
            <div className="space-y-4">
              {isLoadingFolders ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="text-gray-500 font-medium">Loading folders...</p>
                </div>
              ) : isFoldersError ? (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">Failed to load folders</p>
                  <button 
                    onClick={() => refetchFolders()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : folders.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No folders found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {folders.map((folder) => (
                    <button
                      key={folder._id}
                      onClick={() => setSelectedFolder(folder)}
                      className="flex flex-col gap-2 p-3 rounded-2xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 group text-left"
                    >
                      <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative">
                        {folder.cover?.location ? (
                          <img 
                            src={folder.cover.location} 
                            alt={folder.name} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                             <svg className="w-10 h-10 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                             </svg>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white">
                           {folder.noOfImages || 0}
                        </div>
                      </div>
                      <span className="font-semibold text-gray-800 text-sm truncate">{folder.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Image Grid View
            <div className="space-y-4">
               {isLoadingImages ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="text-gray-500 font-medium">Loading images...</p>
                </div>
              ) : isImagesError ? (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">Failed to load images</p>
                  <button 
                    onClick={() => refetchImages()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">This folder is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((image) => {
                    const isSelected = selectedImage?._id === image._id;
                    return (
                      <button
                        key={image._id}
                        onClick={() => setSelectedImage(image)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-transparent"
                        }`}
                      >
                        <img 
                          src={image.location} 
                          alt={image.filename} 
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                            <div className="bg-white rounded-full p-0.5">
                              <Check className="w-6 h-6 text-blue-500" strokeWidth={3} />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!selectedImage}
            onClick={handleImport}
            className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Selected Image
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ImportFolderModal;
