"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { changePasswordApi } from "@/services/authApi";
import { Toast } from "@/components/ui/toast";

export default function ChangePassword() {
  const [form, setForm] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  const mutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      setToast({
        open: true,
        message: "Password changed successfully!",
        type: "success",
      });
      setForm({
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to change password. Please try again.";
      setToast({
        open: true,
        message: errorMessage,
        type: "error",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!form.password || !form.newPassword || !form.confirmPassword) {
      setToast({
        open: true,
        message: "Please fill in all fields.",
        type: "error",
      });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setToast({
        open: true,
        message: "New passwords do not match.",
        type: "error",
      });
      return;
    }

    if (form.newPassword.length < 8) {
      setToast({
        open: true,
        message: "New password must be at least 8 characters long.",
        type: "error",
      });
      return;
    }

    mutation.mutate({
      password: form.password,
      newPassword: form.newPassword,
    });
  };

  return (
    <div className="flex-1 bg-white rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm h-auto md:min-h-[600px] animate-in fade-in duration-300">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
      
      {/* Title Header */}
      <div className="py-4 md:py-6 border-b border-gray-100">
        <h2 className="text-center text-xl font-bold text-gray-800">Change Password</h2>
      </div>

      <div className="p-4 md:p-10 max-w-4xl">
        {/* Existing Password Section */}
        <div className="mb-10">
          <label className="block text-lg font-bold text-black mb-4">
            Enter existing password
          </label>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Current password"
              className="w-full rounded-full bg-[#F3F4F6] px-6 py-4 text-gray-500 outline-none focus:ring-1 focus:ring-blue-300 transition-all"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[#4F6EF7] transition-colors"
            >
              {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          <div className="mt-3 flex items-start gap-2 text-[#C2C2C2]">
             <Info className="h-4 w-4 mt-0.5" strokeWidth={2.5} />
             <p className="text-sm font-medium leading-tight">
               You must enter current password in order to change your password.
             </p>
          </div>
        </div>

        {/* New Password Section */}
        <div className="space-y-6">
          <label className="block text-lg font-bold text-black">
            Enter new password & confirm
          </label>
          
          <div className="relative group">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="New password"
              className="w-full rounded-full bg-[#F3F4F6] px-6 py-4 text-gray-500 outline-none focus:ring-1 focus:ring-blue-300 transition-all"
            />
            <button 
              type="button" 
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[#4F6EF7] transition-colors"
            >
              {showNewPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm New password"
              className="w-full rounded-full bg-[#F3F4F6] px-6 py-4 text-gray-500 outline-none focus:ring-1 focus:ring-blue-300 transition-all"
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[#4F6EF7] transition-colors"
            >
              {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleSave}
          disabled={mutation.isPending}
          className="mt-10 w-full md:w-52 py-3.5 rounded-full bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white font-bold text-lg shadow-[0_10px_20px_rgba(59,84,240,0.3)] hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
        >
          {mutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
          {mutation.isPending ? "Changing..." : "Save"}
        </button>
      </div>
    </div>
  );
}