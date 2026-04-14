"use client";

import { useEffect, useRef, useState } from "react";
import AnalyzingModal from "./AnalyzingModalProps";

export default function Imagepage({
  preview,
  setIsImage,
  handleRemoveImage,
  handleImageUpload,
  status,
  onSuccess,
}: {
  preview: string | null;
  setIsImage: React.Dispatch<React.SetStateAction<boolean>>;
  handleRemoveImage: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  status: "idle" | "pending" | "success" | "error";
  onSuccess?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modal is now driven by status prop
  const showModal = status !== "idle";

  // Image change function
  

  return (
    <div className="">
      <div className="h-screen flex justify-center shadow-sm  m-4">
        
          <img
            src={preview || ""}
            alt="preview"
            className=" max-w-[380px] max-h-[70vh]   rounded-xl border-dashed border-2 border-[#6CACDF]/50   "
            />
    
            </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        />

      {/* Modal */}
      {showModal && (
        <AnalyzingModal
          setIsImage={setIsImage}
          handleRemoveImage={handleRemoveImage}
          isOpen={showModal}
          onChangeImage={() => fileInputRef.current?.click()}
          status={status}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
