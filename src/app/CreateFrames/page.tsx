"use client";
import Header from '@/components/global/header';
import React, { useState } from 'react';

interface CreateFrame {
  onCreateFrame?: (data: { name: string; category: 'public' | 'private'; location: string }) => void;
  onBack?: () => void;
}

const CreateFrame: React.FC<CreateFrame> = ({ onCreateFrame, onBack }) => {
  const [frameName, setFrameName] = useState('');
  const [category, setCategory] = useState<'public' | 'private'>('public');
  const [location, setLocation] = useState('');

  const handleCreate = () => {
    if (onCreateFrame) {
      onCreateFrame({ name: frameName, category, location });
    }
  };

  return (
    <div>
    <div className="min-h-screen bg-gray-50">
<Header/>
      <div className="max-w-2xl mx-auto p-6">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="mb-6 p-2 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Go back"
        >
          <svg
            className="w-6 h-6 text-gray-800"
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

        {/* Header Text */}
        <div className="text-center mb-8">
          <p className="text-gray-700 text-sm leading-relaxed">
            Enter the name of this frame, select the frame category (private or<br />
            public) and select the location to create your new frame!
          </p>
        </div>

        {/* Frame Name Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter frame name"
            value={frameName}
            onChange={(e) => setFrameName(e.target.value)}
            className="w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Frame Category Selection */}
        <div className="flex gap-4 mb-6">
          {/* Public Frame */}
          <button
            onClick={() => setCategory('public')}
            className={`flex-1 py-8 rounded-3xl transition-all ${
              category === 'public'
                ? 'bg-gradient-to-tl from-[#0000FE] to-[#6CACDF] text-white shadow-lg'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
             <img
  src={
    category === "public"
    ? "/images/publicwhite.png"
    : "/images/world.png"
  }
  className="w-[40px] transition-all duration-300 group-hover:opacity-0"
  alt=""
/>
              <span className="font-medium">Public Frame</span>
            </div>
          </button>

          {/* Private Frame */}
          <button
            onClick={() => setCategory('private')}
            className={`flex-1 py-8 rounded-3xl transition-all ${
              category === 'private'
                ? 'bg-gradient-to-tl from-[#0000FE] to-[#6CACDF] text-white shadow-lg'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
<img
  src={
    category === "private"
      ? "/images/lockicon.png"
      : "/images/lockiconblue.png"
  }
  className="w-[40px] transition-all duration-300 group-hover:opacity-0"
  alt=""
/>              <span className="font-medium">Private Frame</span>
            </div>
          </button>
        </div>

        {/* Select Location */}
        <button className="w-full px-6 py-4 bg-gray-100 rounded-full flex items-center justify-between mb-6 hover:bg-gray-200 transition-colors">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 font-medium">Select Location</span>
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

        {/* Create Frame Button */}
        <button
          onClick={handleCreate}
          className="w-full max-w-sm mx-auto block py-4 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-full transition-colors"
        >
          Create Frame
        </button>
      </div>
    </div>
            </div>
  );
};

export default CreateFrame;