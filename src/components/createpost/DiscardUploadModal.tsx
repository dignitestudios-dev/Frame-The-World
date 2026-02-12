import React from 'react';

interface DiscardUploadModalProps {
  isOpen?: boolean;
  onDiscard?: () => void;
  onCancel?: () => void;
}

const DiscardUploadModal: React.FC<DiscardUploadModalProps> = ({
  isOpen ,
  onDiscard,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/10 bg-opacity-50" />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Icon Section */}
        <div className="bg-gradient-to-b from-blue-100 to-blue-50 pt-8 pb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-red-400 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-9 h-9 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white px-6 pt-6 pb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Discard Upload?
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Are you sure you want to cancel this uploading process?
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDiscard}
              className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
            >
              Discard
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 bg-green-400 hover:bg-green-500 text-gray-900 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscardUploadModal;