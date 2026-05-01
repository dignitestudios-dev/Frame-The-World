"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { reportEntityApi } from "@/services/userApi";
// import { toast } from "react-hot-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: "User" | "Post" | "Frame";
  supportingEntityId?: string;
  supportingEntityType?: "User" | "Post" | "Frame";
}

const REPORT_REASONS = [
  "Spam",
  "Inappropriate Content",
  "Harassment",
  "False Information",
  "Intellectual Property Violation",
  "Other",
];

const ReportModal = ({
  isOpen,
  onClose,
  entityId,
  entityType,
  supportingEntityId,
  supportingEntityType,
}: ReportModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { mutate: submitReport, isPending } = useMutation({
    mutationFn: reportEntityApi,
    onSuccess: () => {
      // toast.success(`${entityType} reported successfully.`);
      onClose();
      setSelectedReason("");
      setDescription("");
    },
    onError: (error: any) => {
      // toast.error(error?.response?.data?.message || "Failed to submit report. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;
    
    // For "Other", description is required. For others, it's optional but we can send it if user typed something.
    if (selectedReason === "Other" && !description.trim()) {
      // toast.error("Please provide more details for 'Other' reason.");
      return;
    }
    
    submitReport({
      entityId,
      entityType,
      reason: selectedReason,
      description: description.trim() || undefined,
      supportingEntityId: supportingEntityId ,
      supportingEntityType: supportingEntityType ,
    });
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={!isPending ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[440px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="bg-[#E4E9FF] pt-4 pb-6 flex flex-col items-center relative">
          <div className="w-12 h-1.5 bg-black/20 rounded-full mb-5" />
          <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Report {entityType}</h2>
        </div>

        <div className="px-10 py-10">
          <h3 className="text-center text-[19px] font-bold text-gray-900 mb-10 leading-snug">
            Why are you reporting this {entityType.toLowerCase()}?
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              {REPORT_REASONS.map((reason) => (
                <div key={reason} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReason(reason);
                      if (reason !== "Other" && !description) {
                         // Keep description if user switched back and forth? 
                         // Or clear it? Snippet didn't show description for non-other.
                         // User asked for text box only for "Other".
                      }
                    }}
                    className="flex items-center gap-6 w-full text-left group outline-none"
                  >
                    <div className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedReason === reason 
                        ? "border-blue-600 bg-white" 
                        : "border-gray-900 bg-white"
                    }`}>
                      {selectedReason === reason && (
                        <div className="w-[10px] h-[10px] rounded-full bg-blue-600" />
                      )}
                    </div>
                    <span className={`text-[16px] font-medium transition-colors ${
                      selectedReason === reason ? "text-gray-900" : "text-gray-600"
                    }`}>
                      {reason}
                    </span>
                  </button>

                  {/* Conditional Text Area for 'Other' */}
                  {reason === "Other" && selectedReason === "Other" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="relative">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                          placeholder="Tell us more..."
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none min-h-[100px] resize-none"
                        />
                        <div className="absolute bottom-3 right-4 text-[11px] font-bold text-gray-400">
                          {description.length}/100
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isPending || !selectedReason || (selectedReason === "Other" && !description.trim())}
                className="w-full py-4 gradient-bg text-white rounded-full text-[17px] font-bold shadow-[0_8px_30px_rgb(59,130,246,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;
