"use client";

import Header from '@/components/global/header';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFolderApi } from '@/services/frameApi';
import { Toast } from '@/components/ui/toast';
import { getApiErrorMessage } from '@/lib/apiError';
import { useAccessControl } from '@/providers/AccessControlProvider';
import { ImagePlus, X, Loader2 } from 'lucide-react';

interface CreateFolderPageProps {
  onCreateFolder?: (formData: FormData) => void;
  onBack?: () => void;
}

const MAX_FOLDER_NAME_LENGTH = 100;
const MAX_IMAGE_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB per backend specs
const SUCCESS_REDIRECT_DELAY_MS = 1500;

const CreateFolderPage: React.FC<CreateFolderPageProps> = ({
  onCreateFolder,
  onBack,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { executeWithCheck } = useAccessControl();
  
  const [folderName, setFolderName] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [coverError, setCoverError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const isValidFolderName = (name: string) => {
    // 1. Check restricted characters
    const restrictedRegex = /[\\/:*?"<>|]/;
    if (restrictedRegex.test(name)) return false;

    // 2. Must contain at least 1 letter or number
    const mustHaveAlphaNum = /[a-zA-Z0-9]/;
    if (!mustHaveAlphaNum.test(name)) return false;

    return true;
  };

  const handleFileChange = (file: File | null) => {
    setCoverError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCoverError('Cover must be a valid image file (PNG, JPG, WEBP, etc.).');
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      setCoverError('Cover image must be 50MB or smaller.');
      return;
    }

    setCoverFile(file);
  };

  const createFolderMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await createFolderApi(formData);
      if (response?.success === false) {
        throw new Error(response?.message || 'Failed to create folder');
      }
      return response;
    },
    onSuccess: () => {
      setToast({
        open: true,
        message: 'Folder created successfully!',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['personalFolders'] });
      setFolderName('');
      setCoverFile(null);
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
    setNameError('');
    setCoverError('');

    const name = folderName.trim();
    if (!name) {
      setNameError('Folder name is required.');
      return;
    }

    if (!isValidFolderName(name)) {
      setNameError(
        'Invalid folder name. Avoid \\ / : * ? " < > | and include at least one letter or number.'
      );
      return;
    }

    if (!coverFile) {
      setCoverError('Folder cover image is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('cover', coverFile);

    if (onCreateFolder) {
      onCreateFolder(formData);
      return;
    }

    executeWithCheck(() => {
      void createFolderMutation.mutateAsync(formData);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((previous) => ({ ...previous, open: false }))}
      />
      <Header title="Create Storage Folder" subtitle="Save before posting." />

      <div className="max-w-2xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => {
            if (onBack) {
              onBack();
              return;
            }
            router.push('/Profile?tab=space');
          }}
          className="mb-6 p-2 hover:bg-gray-200 rounded-full transition-colors inline-flex items-center gap-2 text-gray-700"
          aria-label="Go back"
        >
          <svg
            className="w-5 h-5 text-gray-800"
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
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Storage Folder
          </h1>
          <p className="text-gray-600 text-sm">
            Upload a cover image and enter a folder name to create your private Space.
          </p>
        </div>

        {/* Cover Image Upload Area */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Folder Cover Image <span className="text-red-500">*</span>
          </label>

          {coverPreviewUrl ? (
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-sm group bg-gray-900">
              <Image
                src={coverPreviewUrl}
                alt="Folder Cover Preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white/90 text-gray-900 rounded-full text-xs font-semibold shadow hover:bg-white transition"
                >
                  Change Cover
                </button>
                <button
                  type="button"
                  onClick={() => setCoverFile(null)}
                  className="p-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition"
                  aria-label="Remove Cover"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileChange(file);
              }}
              className="relative block w-full border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-10 text-center cursor-pointer group hover:bg-blue-50 hover:border-blue-400 transition-all"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-100/80 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                  <ImagePlus className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-blue-600 mb-1">
                  Upload Cover Image
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, JPEG, WEBP up to 50MB
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
              e.target.value = '';
            }}
          />

          {coverError && (
            <p className="text-red-500 text-xs font-medium mt-2">
              {coverError}
            </p>
          )}
        </div>

        {/* Input Field */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Folder Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter folder name (e.g. Summer Vacation)"
            value={folderName}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= MAX_FOLDER_NAME_LENGTH) {
                setFolderName(value);
                if (value && !isValidFolderName(value)) {
                  setNameError(
                    'Invalid characters. Avoid \\ / : * ? " < > | and use letters/numbers.'
                  );
                } else {
                  setNameError('');
                }
              }
            }}
            maxLength={MAX_FOLDER_NAME_LENGTH}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium shadow-sm"
          />
          <div className="flex justify-between items-center mt-1.5">
            {nameError ? (
              <p className="text-red-500 text-xs font-medium">{nameError}</p>
            ) : <span />}
            <span className="text-[11px] text-gray-400 ml-auto">
              {folderName.length}/{MAX_FOLDER_NAME_LENGTH}
            </span>
          </div>
        </div>

        {/* Create Folder Button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={
              !folderName.trim() ||
              !coverFile ||
              createFolderMutation.isPending
            }
            className="w-full sm:w-auto px-16 py-3.5 bg-gradient-to-r from-[#6CACDF] to-[#0000FE] hover:opacity-95 text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createFolderMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Folder...</span>
              </>
            ) : (
              <span>Create Folder</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderPage;