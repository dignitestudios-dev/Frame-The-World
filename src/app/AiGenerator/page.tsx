"use client";

import React, { useState } from "react";
import { Sparkles, ArrowLeft, Copy, RotateCw } from "lucide-react";
import Header from "@/components/global/header";
import Image from "next/image";
import { useRouter } from "next/navigation";  // Import useRouter

const CaptionGenerator: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [generated, setGenerated] = useState(false);
  const router = useRouter();  // Initialize router

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    const totalFiles = [...selectedFiles, ...fileArray];

    if (totalFiles.length > 4) {
      alert("Maximum 4 images allowed");
      return;
    }

    setSelectedFiles(totalFiles);
  };

  const handleRemoveImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const handleGenerate = () => {
    console.log("Generate button clicked");
    setGenerated(true);
  };

  // Handle back button click
  const handleBackClick = () => {
    router.back(); // Go back one page in history
  };

  return (
    <div className="">
      <Header />
      <div className="w-[80%] mx-auto min-h-screen p-6">
        {/* Back Button */}
        <button
          onClick={handleBackClick}  // Attach the back functionality
          className="flex items-center gap-2 text-gray-700 mb-8 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side */}
          <div className="space-y-6">
            {/* Header with Sparkles */}
            <div className="mb-8">
              <div className="flex justify-center gap-3 mb-4">
                <div className="">
                  <Image
                    src="/images/stars.png"
                    alt="Stars"
                    width={110}
                    height={110}
                    className=""
                  />
                </div>
              </div>
              <p className="text-gray-700 text-base leading-relaxed">
                Upload a few pictures and our AI will analyze them to create relevant captions and hashtags for you. Review before sharing to make sure they fit your style.
              </p>
            </div>

            {/* Upload Box */}
            <div className="flex items-center gap-4">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md group"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Dark Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200"></div>

                  {/* Remove Button (Shows on Hover) */}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition duration-200 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {selectedFiles.length < 4 && (
                <>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                  />

                  {selectedFiles.length === 0 ? (
                    <div className="bg-blue-50/50 border-2 border-dashed border-blue-300 rounded-3xl p-12 text-center w-full">
                      <label htmlFor="fileInput" className="cursor-pointer">
                        <div className="space-y-4">
                          <h3 className="text-blue-600 font-medium text-lg">Upload Pictures</h3>
                          <p className="text-gray-500 text-sm">Max Limit 5Mbs, PNG, JPG, JPEG</p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="fileInput"
                      className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center cursor-pointer shadow-md hover:bg-blue-200 transition"
                    >
                      <span className="text-3xl text-blue-600 font-bold">+</span>
                    </label>
                  )}
                </>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={selectedFiles.length === 0}
              className={`w-full py-4 rounded-full font-medium text-base transition-all ${
                selectedFiles.length === 0
                  ? "bg-[#6CACDF] text-white cursor-not-allowed"
                  : "bg-gradient-to-b from-[#6CACDF] to-[#0000FE] text-white py-4 rounded-full font-medium text-base shadow-md hover:shadow-xl transition-all"
              }`}
            >
              Generate
            </button>
          </div>

          {/* Right Side - Result Placeholder */}
          <div className="bg-blue-50/80 rounded-3xl flex items-center justify-center min-h-[500px]">
            {!generated ? (
              // 🔹 Placeholder (Before Generate)
              <div className="text-center">
                <div className="mb-6">
                  <Image
                    src="/images/contant.png"
                    alt="Result"
                    width={200}
                    height={200}
                  />
                </div>
                <p className="text-[#6CACDF80] font-medium">Result Will Appear Here</p>
              </div>
            ) : (
              // 🔹 Generated Content
              <div className="relative rounded-3xl p-8 min-h-[500px] w-full bg-gradient-to-b from-[#EEF4FF] to-[#E3ECFF]">
                <div className="space-y-6">
                  <p className="text-gray-700 text-base leading-relaxed">
                    Lost in the calm whispers of the river, where every wave tells a story.
                  </p>
                </div>

                <div className="absolute bottom-6 right-6 flex items-center gap-4">
                  <button className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#6CACDF] to-[#0000FE] flex items-center justify-center shadow-md hover:scale-105 transition">
                    <Copy size={18} className="text-white" />
                  </button>

                  <button className="text-blue-600 hover:rotate-180 transition duration-300">
                    <RotateCw size={22} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;
