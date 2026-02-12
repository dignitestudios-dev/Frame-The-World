"use client";

import { useEffect, useRef, useState } from "react";
import AnalyzingModal from "./AnalyzingModalProps";

export default function Imagepage({ preview ,setIsImage ,handleRemoveImage ,handleImageUpload }: { preview: string | null }) {
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modal auto open after image change
  useEffect(() => {
    if (!preview) return;

    setShowModal(false);

    const timer = setTimeout(() => {
      setShowModal(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [  preview]);

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
        />
    )}
    </div>
  );
}
