"use client";

import Imagepage from "@/components/createpost/Imagepage";
import Header from "@/components/global/header";
import React, { useEffect, useState } from "react";

interface UploadFormProps {
  onGenerate?: (data: FormData) => void;
}

interface FormData {
  image: File | null;
  destination: string;
  location: string;
  state: string;
  country: string;
  agreedToTerms: boolean;
}

const UploadForm: React.FC<UploadFormProps> = ({ onGenerate }) => {
  const [formData, setFormData] = useState<FormData>({
    image: null,
    destination: "",
    location: "",
    state: "",
    country: "",
    agreedToTerms: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
const [isImage, setIsImage] = useState<boolean>(false);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setFormData({ ...formData, image: file });

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setIsImage(true);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));

    setImagePreview(null);
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate(formData);
    }
  };
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  return (
    <div className="min-h-screen">
      <Header />
      {isImage ? (
        <Imagepage
          handleRemoveImage={handleRemoveImage}
          preview={imagePreview}
          setIsImage={setIsImage}
          handleImageUpload={handleImageUpload}
         
        />
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 m-4">
          {/* Header */}
          <div className="flex items-start  mb-6">
            <button className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-lg font-medium mb-2">
                Upload Picture you want to create post
              </h1>
              <p className="text-sm text-gray-600 text-center">
                Our AI ensures every picture is original, no humans, no
                AI-generated images, You can even use the AI tool to remove
                humans from your own clicks before posting.
              </p>
            </div>
          </div>

          <div className="mb-4 ">
            {imagePreview && (
              <div className="mt-4 flex justify-center">
                <div className=" w-70 h-70 group relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl border shadow-sm"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0  rounded-xl  flex items-start justify-end  p-2">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:scale-110 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!imagePreview && (
              <label
                htmlFor="image-upload"
                className="relative block w-full border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl p-12 text-center cursor-pointer group hover:bg-blue-100 transition-colors"
              >
                <div className="text-xs text-gray-500">
                  <div className="text-blue-600 font-medium mb-1">
                    Upload Picture
                  </div>
                  Max Limit 5Mbs, PNG, JPG, JPEG
                </div>

                <input
                  id="image-upload"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {/* Destination Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter destination"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              className="w-full px-4 py-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="mt-2 px-4 text-xs text-blue-500">#tag, #etc</div>
          </div>

          {/* Select Location */}
          <div className="mb-4">
            <button className="w-full px-4 py-3 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-blue-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">Select Location</span>
              </div>
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Select State */}
          <div className="mb-4">
            <select
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.25rem",
              }}
            >
              <option value="">Select State</option>
              <option value="state1">State 1</option>
              <option value="state2">State 2</option>
            </select>
          </div>

          {/* Select Country */}
          <div className="mb-6">
            <select
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.25rem",
              }}
            >
              <option value="">Select Country</option>
              <option value="country1">Country 1</option>
              <option value="country2">Country 2</option>
            </select>
          </div>

          {/* Checkbox */}
          <div className="mb-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreedToTerms: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
              />
              <span className="ml-3 text-sm text-blue-600 underline">
                I agree to content release statement
              </span>
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!formData.image || !formData.agreedToTerms}
            className="w-full py-4 bg-gradient-to-r from-blue-400 to-purple-400 text-white font-medium rounded-full hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
