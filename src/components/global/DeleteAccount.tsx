"use client";

import React from "react";
import { EyeOff, Info } from "lucide-react";

export default function DeleteAccount() {
  return (
    <div className="flex-1 bg-white rounded-[32px] overflow-hidden shadow-sm min-h-[600px] animate-in fade-in duration-300">
      {/* Header */}
      <div className="py-6 border-b border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800">Delete Account</h2>
      </div>

      <div className="p-10 max-w-4xl">
        {/* Password Input */}
        <div className="mb-6">
          <div className="relative group">
            <input
              type="password"
              placeholder="Current password"
              className="w-full rounded-full bg-[#F3F4F6] px-6 py-4 text-gray-500 outline-none focus:ring-1 focus:ring-red-200 transition-all placeholder:text-gray-400"
            />
            <EyeOff className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4F6EF7] cursor-pointer" />
          </div>
          
          {/* Warning Message */}
          <div className="mt-4 flex items-start gap-3 text-[#C2C2C2]">
             <div className="bg-[#4F6EF7] rounded-full p-1 mt-0.5">
                <Info className="h-4 w-4 text-white" strokeWidth={2.5} />
             </div>
             <p className="text-[13px] font-medium leading-relaxed max-w-2xl">
               You must enter current password in order to delete your account. Once your account is 
               deleted you can recover it within 7 days else it will be deleted permanently.
             </p>
          </div>
        </div>

        {/* Delete Action Button */}
        <button className="mt-8 w-full py-4 rounded-full bg-[#F5D7E3] text-red-600 font-bold text-lg hover:bg-red-200 transition-colors shadow-sm">
          Delete Account
        </button>
      </div>
    </div>
  );
}