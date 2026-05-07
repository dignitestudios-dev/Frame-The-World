"use client";

import React, { useState } from "react";
import { Info, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { deleteUserApi } from "@/services/userApi";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/apiError";
import ConfirmDeleteModal from "@/components/global/ConfirmDeleteModal";
import { Toast } from "@/components/ui/toast";

export default function DeleteAccount() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { logout } = useAuthStore();
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      setIsModalOpen(false);
      logout();
      router.push("/");
    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastOpen(true);
      setIsModalOpen(false);
    },
  });

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 bg-white rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm h-auto md:min-h-[600px] animate-in fade-in duration-300">
      {/* Header */}
      <div className="py-4 md:py-6 border-b border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800">Delete Account</h2>
      </div>

      <Toast
        open={toastOpen}
        message={toastMessage}
        type="error"
        onClose={() => setToastOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        variant="card"
        title="Delete Account?"
        description="Are you sure you want to delete your account? This action cannot be undone and you will lose all your data."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deleteMutation.isPending}
      />

      <div className="p-4 md:p-10 max-w-4xl">
        {/* Warning Message */}
        <div className="flex items-start gap-4 p-6 bg-red-50 rounded-[24px] border border-red-100 mb-8">
          <div className="bg-red-500 rounded-full p-2 mt-0.5 shadow-sm shadow-red-200">
            <Info className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h3 className="text-[16px] font-bold text-red-900">Warning</h3>
            <p className="text-[13px] font-medium text-red-700 leading-relaxed max-w-2xl">
              Deleting your account is permanent. Once your account is deleted, it will be deleted permanently along with all your data, frames, and posts.
            </p>
          </div>
        </div>

        {/* Delete Action Button */}
        <div className="max-w-full">
          <button
            onClick={handleDeleteClick}
            disabled={deleteMutation.isPending}
            className="w-full py-4 px-8 rounded-full bg-[#F5D7E3] text-red-600 font-bold text-lg hover:bg-red-100 transition-all shadow-sm border border-red-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-5 w-5" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}