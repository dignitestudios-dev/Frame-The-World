"use client";
import Header from '@/components/global/header';
import React, { useState } from 'react';

interface CreateFolderPageProps {
  onCreateFolder?: (folderName: string) => void;
  onBack?: () => void;
}

const CreateFolderPage: React.FC<CreateFolderPageProps> = ({
  onCreateFolder,
  onBack,
}) => {
  const [folderName, setFolderName] = useState('');

  const handleCreate = () => {
    if (onCreateFolder && folderName.trim()) {
      onCreateFolder(folderName);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-2xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 p-2 hover:bg-gray-200 rounded-full transition-colors"
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
        <div className="text-center mb-12">
          <p className="text-gray-800 text-base">
            Enter the name of this folder to create your new private Space!
          </p>
        </div>

        {/* Input Field */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Enter frame name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full px-0 py-3 border-b border-gray-300 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
        </div>

        {/* Create Folder Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCreate}
            disabled={!folderName.trim()}
            className="px-32 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Folder
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderPage;