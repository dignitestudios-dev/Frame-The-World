"use client";

import React, { useState } from "react";
import { Sparkles, ArrowLeft, Copy, RotateCw, Loader2, Check } from "lucide-react";
import Header from "@/components/global/header";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { generateAiCaptionApi } from "@/services/postApi";
import { Toast } from "@/components/ui/toast";

const CaptionGenerator: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const router = useRouter();

  const { mutate: handleGenerate, isPending } = useMutation({
    mutationFn: (formData: FormData) => generateAiCaptionApi(formData),
    onSuccess: (res) => {
      const data = res?.data || res;
      setCaption(data?.caption || "");
      
      // Handle hashtags as array or string
      if (Array.isArray(data?.hashtags)) {
        setHashtags(data.hashtags);
      } else if (typeof data?.hashtags === "string") {
        setHashtags(data.hashtags.split(",").map((s: string) => s.trim()));
      } else {
        setHashtags([]);
      }
    },
    onError: (err: any) => {
      console.error("AI Generation failed:", err);
      setToast({
        open: true,
        message: err?.response?.data?.message || "Failed to generate AI content. Please try again.",
        type: "error"
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const totalFiles = [...selectedFiles, ...fileArray];

    if (totalFiles.length > 4) {
      setToast({ open: true, message: "Maximum 4 images allowed", type: "error" });
      return;
    }

    setSelectedFiles(totalFiles);
  };

  const handleRemoveImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const onGenerate = () => {
    if (selectedFiles.length === 0) return;
    
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file); // Ensure "images" matches backend expectations
    });
    
    handleGenerate(formData);
  };

  const handleCopy = () => {
    const fullText = `${caption}\n\n${hashtags.join(" ")}`;
    navigator.clipboard.writeText(fullText);
    setToast({ open: true, message: "Copied to clipboard!", type: "success" });
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header title="AI Content Generator" subtitle="Generate amazing captions for your images quickly with the help of AI" />
      
      <Toast 
        open={toast.open} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, open: false })} 
      />

      <div className="w-[90%] max-w-6xl mx-auto p-4 md:p-6">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-gray-700 mb-6 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side: Upload & Action */}
          <div className="space-y-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-4">
                <Image
                  src="/images/stars.png"
                  alt="Stars"
                  width={80}
                  height={80}
                  className="opacity-90"
                />
              </div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Instantly creates full Instagram and Facebook captions with tone and hashtags, turning a simple idea into a ready-to-post caption in seconds.
              </p>
            </div>

            {/* Upload Box */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Select Images</h3>
              <div className="flex flex-wrap items-center gap-4">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm group border border-gray-200"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {selectedFiles.length < 4 && (
                  <>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileInput"
                    />
                    <label
                      htmlFor="fileInput"
                      className="w-24 h-24 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      <span className="text-2xl text-blue-400 group-hover:scale-110 transition-transform">+</span>
                      <span className="text-[10px] font-bold text-blue-400 uppercase mt-1">Add Image</span>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={onGenerate}
              disabled={selectedFiles.length === 0 || isPending}
              className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                selectedFiles.length === 0 || isPending
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Caption
                </>
              )}
            </button>
          </div>

          {/* Right Side: Result Area */}
          <div className="flex flex-col h-full min-h-[400px]">
            {!caption && !isPending ? (
              <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <Image
                    src="/images/contant.png"
                    alt="Placeholder"
                    width={100}
                    height={100}
                    className="opacity-50"
                  />
                </div>
                <h4 className="text-lg font-bold text-gray-400">Result Will Appear Here</h4>
                <p className="text-sm text-gray-400 mt-2 max-w-xs">
                  Upload your photos and click generate to see AI-powered magic.
                </p>
              </div>
            ) : isPending ? (
              <div className="flex-1 bg-blue-50/30 border border-blue-100 rounded-3xl flex flex-col items-center justify-center p-12 text-center animate-pulse">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <h4 className="text-xl font-bold text-blue-900">AI is Thinking...</h4>
                <p className="text-sm text-blue-600 mt-2">Analyzing your images for the perfect caption.</p>
              </div>
            ) : (
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 md:p-8 flex flex-col shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-blue-900 flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    Generated for You
                  </h3>
                  <button 
                    onClick={handleCopy}
                    className="p-2.5 rounded-xl bg-white text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 group"
                  >
                    <Copy size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase hidden sm:inline">Copy All</span>
                  </button>
                </div>

                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest pl-1">Caption</label>
                    <textarea 
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="flex-1 w-full p-5 rounded-2xl bg-white/80 border border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 text-sm md:text-base leading-relaxed resize-none shadow-sm"
                      placeholder="Enter caption..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest pl-1">Hashtags</label>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1.5 rounded-full bg-blue-100/50 text-blue-600 text-xs font-bold border border-blue-200"
                        >
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => { setCaption(""); setHashtags([]); }}
                    className="text-blue-500 font-bold text-xs uppercase flex items-center gap-2 hover:text-blue-700 transition"
                  >
                    <RotateCw size={14} />
                    Try Another One
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

