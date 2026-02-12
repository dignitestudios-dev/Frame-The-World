import React from "react";
import { EyeOff, Info } from "lucide-react";

export default function ChangePassword() {
  return (
    <div className="flex-1 bg-white rounded-[32px] overflow-hidden shadow-sm min-h-[600px]">
      {/* Title Header */}
      <div className="py-6 border-b border-gray-100">
        <h2 className="text-center text-xl font-bold text-gray-800">Change Password</h2>
      </div>

      <div className="p-10 max-w-4xl">
        {/* Existing Password Section */}
        <div className="mb-10">
          <label className="block text-lg font-bold text-black mb-4">
            Enter existing password
          </label>
          <div className="relative group">
            <input
              type="password"
              placeholder="Current password"
              className="w-full rounded-full bg-[#F3F4F6] px-6 py-4 text-gray-500 outline-none focus:ring-1 focus:ring-blue-300 transition-all"
            />
            <EyeOff className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4F6EF7] cursor-pointer" />
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
          
          <div className="relative">
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-full bg-[#F3F4F6] px-6 py-4 text-gray-500 outline-none focus:ring-1 focus:ring-blue-300 transition-all"
            />
            <EyeOff className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4F6EF7] cursor-pointer" />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Confirm New password"
              className="w-full rounded-full bg-[#F3F4F6] px-6 py-4 text-gray-500 outline-none focus:ring-1 focus:ring-blue-300 transition-all"
            />
            <EyeOff className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4F6EF7] cursor-pointer" />
          </div>
        </div>

        {/* Action Button */}
        <button className="mt-10 w-52 py-3.5 rounded-full bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white font-bold text-lg shadow-[0_10px_20px_rgba(59,84,240,0.3)] hover:scale-[1.02] transition-transform">
          Save
        </button>
      </div>
    </div>
  );
}