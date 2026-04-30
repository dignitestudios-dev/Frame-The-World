"use client";
import Header from '@/components/global/header';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFolderApi } from '@/services/frameApi';
import { Toast } from '@/components/ui/toast';
import { getApiErrorMessage } from '@/lib/apiError';

interface CreateFolderPageProps {
  onCreateFolder?: (folderName: string) => void;
  onBack?: () => void;
}

const MAX_FOLDER_NAME_LENGTH = 40;
const SUCCESS_REDIRECT_DELAY_MS = 1800;

const CreateFolderPage: React.FC<CreateFolderPageProps> = ({
  onCreateFolder,
  onBack,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  const isValidFolderName = (name: string) => {
    // 1. Check restricted characters
    const restrictedRegex = /[\\/:*?"<>|]/;
    if (restrictedRegex.test(name)) return false;

    // 2. Allow anything except restricted, but must contain at least 1 letter or number
    const mustHaveAlphaNum = /[a-zA-Z0-9]/;
    if (!mustHaveAlphaNum.test(name)) return false;

    return true;
  };

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await createFolderApi({ name });
      if (response?.success === false) {
        throw new Error(response?.message || 'Failed to create folder');
      }
      return response;
    },
    onSuccess: () => {
      setToast({
        open: true,
        message: 'Create successfully',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['personalFolders'] });
      setFolderName('');
      setTimeout(() => {
        router.push('/Profile?tab=space');
      }, SUCCESS_REDIRECT_DELAY_MS);
    },
    onError: (error) => {
      setToast({
        open: true,
        message: getApiErrorMessage(error),
        type: 'error',
      });
    },
  });

  const handleCreate = async () => {
    const name = folderName.trim();
    if (!name) return;

    if (!isValidFolderName(name)) {
      setToast({
        open: true,
        message:
          'Invalid folder name. Avoid \\ / : * ? " < > | and use at least one letter or number.',
        type: 'error',
      });
      return;
    }

    if (onCreateFolder) {
      onCreateFolder(name);
      return;
    }

    await createFolderMutation.mutateAsync(name);
  };

  return (
    <div className="min-h-screen">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((previous) => ({ ...previous, open: false }))}
      />
      <Header />
      <div className="max-w-2xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => {
            if (onBack) {
              onBack();
              return;
            }
            router.push('/home');
          }}
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Create Storage Folder
          </h1>
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
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= MAX_FOLDER_NAME_LENGTH) {
                setFolderName(value);

                if (value && !isValidFolderName(value)) {
                  setError('Invalid characters in folder name');
                } else {
                  setError('');
                }
              }
            }}
            maxLength={MAX_FOLDER_NAME_LENGTH}
            className="w-full px-0 py-3 border-b border-gray-300 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Create Folder Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCreate}
            disabled={!folderName.trim() || createFolderMutation.isPending}
            className="px-32 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderPage;