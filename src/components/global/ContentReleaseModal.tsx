"use client";

import React from "react";
import { X } from "lucide-react";

interface ContentReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContentReleaseModal: React.FC<ContentReleaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Content Release Statement</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto text-gray-700 leading-relaxed space-y-4">
          <p>
            By uploading content to Frame The World, you agree to the following terms:
          </p>
          <section>
            <h3 className="font-bold text-gray-900 mb-1">1. Ownership</h3>
            <p className="text-sm">
              You retain all ownership rights to the content you upload. However, by posting, you grant Frame The World a non-exclusive, worldwide, royalty-free license to use, store, and display your content.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-gray-900 mb-1">2. Originality</h3>
            <p className="text-sm">
              You represent that you are the original creator of the content and that it does not violate the intellectual property rights of any third party.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-gray-900 mb-1">3. Content Standards</h3>
            <p className="text-sm">
              You agree not to upload content that is illegal, offensive, or violates our community guidelines. This includes but is not limited to adult content, hate speech, or harassment.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-gray-900 mb-1">4. Privacy</h3>
            <p className="text-sm">
              You understand that content you post publicly will be visible to other users. Do not upload sensitive personal information.
            </p>
          </section>
          <p className="text-xs text-gray-500 italic mt-6">
            Last updated: April 2026
          </p>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentReleaseModal;
