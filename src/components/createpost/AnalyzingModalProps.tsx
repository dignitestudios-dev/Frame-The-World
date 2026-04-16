"use client";
import React, { useEffect, useState } from "react";
import DiscardUploadModal from "./DiscardUploadModal";

type ModalStep = "analyzing" | "result" | "final-error";

interface CheckItem {
  id: number;
  label: string;
  status: "success" | "error" | "loading";
}

interface AnalyzingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAiEdit?: () => void;
  onChangeImage?: () => void;
  setIsImage: React.Dispatch<React.SetStateAction<boolean>>;
  handleRemoveImage?: () => void;
  status: "idle" | "pending" | "success" | "error";
  onSuccess?: () => void;
  reason?: string;
  // API detection results
  aiDetection?: { isAI: boolean | null; processedAt?: string | null };
  humanDetection?: { hasHuman: boolean | null; processedAt?: string | null };
  editingDetection?: { isEdited: boolean | null; processedAt?: string | null };
}

const AnalyzingModal: React.FC<AnalyzingModalProps> = ({
  setIsImage,
  handleRemoveImage,
  isOpen,
  onClose,
  onAiEdit,
  onChangeImage,
  status,
  onSuccess,
  reason,
  aiDetection,
  humanDetection,
  editingDetection,
}) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<ModalStep>("analyzing");
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  const [checks, setChecks] = useState<CheckItem[]>([
    { id: 1, label: "Human Detection Check", status: "loading" },
    { id: 2, label: "Editing Manipulation Check", status: "loading" },
    { id: 3, label: "AI Generated Content Check", status: "loading" },
  ]);

  // Build checks from API detection fields
  const buildChecks = (): CheckItem[] => {
    const humanStatus: CheckItem["status"] =
      humanDetection?.hasHuman === null || humanDetection?.hasHuman === undefined
        ? "loading"
        : humanDetection.hasHuman
          ? "error"
          : "success";

    const editingStatus: CheckItem["status"] =
      editingDetection?.isEdited === null || editingDetection?.isEdited === undefined
        ? "success" // null means not processed = treated as passed
        : editingDetection.isEdited
          ? "error"
          : "success";

    const aiStatus: CheckItem["status"] =
      aiDetection?.isAI === null || aiDetection?.isAI === undefined
        ? "loading"
        : aiDetection.isAI
          ? "error"
          : "success";

    return [
      { id: 1, label: "Human Detection Check", status: humanStatus },
      { id: 2, label: "Editing Manipulation Check", status: editingStatus },
      { id: 3, label: "AI Generated Content Check", status: aiStatus },
    ];
  };

  useEffect(() => {
    if (!isOpen) return;
    setVisible(true);

    if (status === "pending") {
      setStep("analyzing");
      setChecks([
        { id: 1, label: "Human Detection Check", status: "loading" },
        { id: 2, label: "Editing Manipulation Check", status: "loading" },
        { id: 3, label: "AI Generated Content Check", status: "loading" },
      ]);
    } else if (status === "success") {
      const builtChecks = buildChecks();
      setChecks(builtChecks);
      setStep("result");
    } else if (status === "error") {
      const builtChecks = buildChecks();
      setChecks(builtChecks);
      setStep("final-error");
    }
  }, [isOpen, status, aiDetection, humanDetection, editingDetection]);

  const StatusIcon = ({ status }: { status: CheckItem["status"] }) => {
    if (status === "success") {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 shadow-[0_0_0_10px_rgba(100,140,230,0.2)] flex items-center justify-center flex-shrink-0">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (status === "error") {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff3b30] to-[#ff3b30] shadow-[0_0_0_10px_rgba(255,59,48,0.2)] flex items-center justify-center flex-shrink-0">
          <span
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: "22px",
              lineHeight: 1,
              fontFamily: "serif",
            }}
          >
            !
          </span>
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin" />
    );
  };

  const hasError = checks.some((c) => c.status === "error");
  const allSuccess = checks.every((c) => c.status === "success");

  // Build a human-readable rejection reason from detection fields
  const buildRejectionReason = (): string => {
    if (reason) return reason;
    const reasons: string[] = [];
    if (aiDetection?.isAI === true)
      reasons.push("The image appears to be AI-generated.");
    if (humanDetection?.hasHuman === false)
      reasons.push("No human was detected in the image.");
    if (editingDetection?.isEdited === true)
      reasons.push("The image shows signs of editing or manipulation.");
    return reasons.length > 0
      ? reasons.join(" ")
      : "Your post was rejected by our AI verification system.";
  };

  useEffect(() => {
    if (allSuccess && status === "success") {
      const timer = setTimeout(() => {
        onSuccess?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allSuccess, status, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-10 z-50  flex items-end justify-center">
      {/* Modal container */}
      <div
        className={`relative w-full max-w-sm h-auto bg-white rounded-t-3xl shadow-sm transition-transform duration-500 ${visible ? "translate-y-0" : "translate-y-full"
          }`}
      >
        {/* Header */}
        <div className="w-full bg-gradient-to-b from-blue-100 to-blue-50 px-2 py-4 flex items-center">
          {step === "final-error" && (
            <button
              onClick={onClose}
              className="hover:bg-blue-200 rounded-full transition-colors mr-2"
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
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div className="flex items-center justify-center w-full">
            {/* <button onClick={() => setIsDiscardModalOpen(true)}>
              <svg
                className="w-6 h-6"
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
            </button> */}
            <h2 className="text-center flex items-center justify-center w-full text-xl font-semibold text-gray-900">
              {step === "analyzing" && "Analyzing..."}
              {step === "result" && "Verification Results"}
              {step === "final-error" && "Verification Failed"}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 my-2">
          {/* Analyzing state — always show all checks with their current status */}
          {step === "analyzing" && (
            <div className="space-y-4">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-center gap-4 border-b border-gray-200 rounded-lg p-4"
                >
                  <StatusIcon status={check.status} />
                  <span>{check.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Success result */}
          {step === "result" && allSuccess && (
            <div className="text-center space-y-4">
              <div className="flex flex-col items-center gap-2">
                <StatusIcon status="success" />
                <p className="text-[21.76px] font-[700] text-[#000E08]">
                  Image Verified
                </p>
                <p>All checks passed, you're good to go!</p>
              </div>
            </div>
          )}

          {/* Error state — show all checks + reason + action buttons */}
          {(step === "final-error" || (step === "result" && hasError)) && (
            <div className="text-center space-y-6">
              {/* All checks with their statuses */}
              <div className="space-y-2">
                {checks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center gap-4 border-b border-gray-200 rounded-lg p-3"
                  >
                    <StatusIcon status={check.status} />
                    <span className="text-sm">{check.label}</span>
                  </div>
                ))}
              </div>

              {/* Rejection Reason */}
              <div className="text-sm font-medium text-red-700 bg-red-50 p-4 rounded-xl border border-red-100 text-left">
                <span className="block font-bold mb-1">Rejection Reason:</span>
                {buildRejectionReason()}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-4">
                {/* <button
                  onClick={onAiEdit}
                  className="w-full py-3 rounded-full font-medium text-base transition-all
                   bg-gradient-to-b from-[#CBFE8B] to-[#81DE76] text-black shadow-md"
                >
                  AI Edit
                </button> */}

                <button
                  onClick={onChangeImage}
                  className="w-full py-3 rounded-full font-medium text-base
                   bg-gradient-to-b from-[#6CACDF] to-[#0000FE] text-white shadow-md"
                >
                  Upload New Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DiscardUploadModal
        isOpen={isDiscardModalOpen}
        onDiscard={() => {
          setIsImage(false);
          handleRemoveImage?.();
        }}
        onCancel={() => setIsDiscardModalOpen(false)}
      />
    </div>
  );
};

export default AnalyzingModal;