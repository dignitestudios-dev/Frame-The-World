"use client";

import {
    ArrowLeft,
    Download,
    BarChart3,
    EllipsisVertical,
    MapPin,
    ArrowUp,
    Layers,
    Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/global/header";
import { useState } from "react";
import SaveModal from "@/components/global/SaveModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery as useInsightsQuery } from "@tanstack/react-query";
import { getPostInsightsApi } from "@/services/postApi";
import AnalyzingModal from "@/components/createpost/AnalyzingModalProps";
import EditPostModal from "@/components/profile/EditPostModal";
import DeleteConfirmModal from "@/components/profile/DeleteConfirmModal";
import { Toast } from "@/components/ui/toast";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ─── Timeframes ──────────────────────────────────────────────────────────────
const TIMEFRAMES = [
    { id: "24h", label: "24h" },
    { id: "week", label: "Week" },
    { id: "month", label: "Monthly" },
    { id: "year", label: "Year" },
];

// ─── OwnPostView ─────────────────────────────────────────────────────────────
export default function OwnPostView({
    currentPost,
    currentPostId,
    imageUrl,
    locationText,
    isDownloading,
    onBack,
    onDownload,
    onDeleteClick,
    toast,
    setToast,
    isSaveOpen,
    setIsSaveOpen,
    deletingPostId,
    setDeletingPostId,
    handleDeleteConfirm,
    isDeleting,
    editingPost,
    setEditingPost,
    queryClient,
    showToast,
    analyzingModalOpen,
    setAnalyzingModalOpen,
    analyzingModalStatus,
    rejectionReason,
    aiDetection,
    humanDetection,
    editingDetection,
    hiddenFileInputRef,
    handleImageChange,
    isUpdatingImage,
    getSafeCount,
}: any) {
    const router = useRouter();
    const [activeTimeframe, setActiveTimeframe] = useState("24h");

    // ── Insights query ──────────────────────────────────────────────────────────
    const { data: insightsData, isLoading: isLoadingInsights } = useInsightsQuery({
        queryKey: ["postInsights", currentPostId, activeTimeframe],
        queryFn: () => getPostInsightsApi(currentPostId, activeTimeframe),
        enabled: !!currentPostId,
    });

    const rawData = insightsData?.data || insightsData;
    const summary = rawData?.summary || { downloads: 0, upvotes: 0, framed: 0 };
    const graphArray: any[] = rawData?.graph || [];

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* ── Header ── */}
            <Header
                title="My Travel Profile"
                subtitle="Your public and private travel profile, all here."
            />

            {/* ── Toast ── */}
            <Toast
                open={toast.open}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast((p: any) => ({ ...p, open: false }))}
            />

            {/* ── Page body ── */}
            <div className="max-w-[1340px] mx-auto px-5 pb-12">

                {/* ── Hero image ── */}
                <div className="relative w-full h-[621px] rounded-[32px] overflow-hidden mt-[32px] shadow-[0px_4px_15px_rgba(0,0,0,0.25)]">
                    <img
                        src={imageUrl}
                        alt={currentPost?.caption || "Post image"}
                        className="w-full h-full object-cover"
                    />
                    {/* gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 rounded-[32px]" />
                    {/* back button */}
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md hover:bg-gray-50 transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#181818]" />
                    </button>
                </div>

                {/* ── Post info row ── */}
                <div className="flex items-start justify-between mt-6 gap-4">
                    {/* Left: title + location + tags */}
                    <div className="flex flex-col gap-1 min-w-0">
                        <h2 className="text-[22px] font-bold text-black leading-[22px] tracking-[-0.408px]">
                            {currentPost?.caption || "Eiffel Tower"}
                        </h2>
                        <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-[10.8px] h-[14.4px] text-black shrink-0" />
                            <span className="text-[16px] font-medium text-black leading-[22px] tracking-[-0.408px]">
                                {locationText || "Paris, France"}
                            </span>
                        </div>
                        <p className="text-[16px] font-normal text-black/70 leading-[22px] tracking-[-0.408px] mt-0.5">
                            {currentPost?.categories?.length
                                ? currentPost.categories.map((c: any) => `#${c?.name || c}`).join(", ")
                                : "#Eiffel, #Tower, #land, #history"}
                        </p>
                    </div>

                    {/* Right: 3 action buttons */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Download */}
                        <button
                            type="button"
                            disabled={isDownloading}
                            onClick={onDownload}
                            className="w-[45px] h-[45px] rounded-[10px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{
                                background: "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                            }}
                        >
                            <Download className="w-[22px] h-[24px] text-white" />
                        </button>

                        {/* Analytics */}
                        <button
                            type="button"
                            className="w-[45px] h-[45px] rounded-[10px] flex items-center justify-center"
                            style={{
                                background: "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                            }}
                        >
                            <BarChart3 className="w-[24px] h-[24px] text-white" />
                        </button>

                        {/* Kebab / 3-dot */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsSaveOpen(true)}
                                className="w-[45px] h-[45px] rounded-[10px] flex items-center justify-center hover:opacity-90 transition-opacity shadow-md"
                                style={{
                                    background: "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                                }}
                            >
                                <EllipsisVertical className="w-[18px] h-[18px] text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Average Performance Summary ── */}
                <h3 className="text-[36px] font-bold text-black leading-[49px] mt-8 mb-4">
                    Average Performance Summary
                </h3>

                {/* ── Stats + Chart card ── */}
                <div
                    className="w-full rounded-[12px] overflow-hidden"
                    style={{
                        background:
                            "linear-gradient(134.74deg, rgba(108,172,223,0.2) 3.24%, rgba(0,0,254,0.2) 139.86%)",
                    }}
                >
                    {isLoadingInsights ? (
                        <div className="flex items-center justify-center h-[234px]">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="flex h-[234px]">
                            {/* ── Left: timeframe tabs + metrics ── */}
                            <div className="flex flex-col justify-center gap-6 pl-8 pr-6 py-5 w-[492px] shrink-0">
                                {/* Timeframe tabs */}
                                <div className="flex items-center gap-2">
                                    {TIMEFRAMES.map((tf) => (
                                        <button
                                            key={tf.id}
                                            onClick={() => setActiveTimeframe(tf.id)}
                                            className={`h-[28px] px-[10px] rounded-[100px] text-[12px] font-medium leading-[16px] text-center capitalize transition-all ${activeTimeframe === tf.id
                                                    ? "text-white"
                                                    : "bg-white/50 text-black/70"
                                                }`}
                                            style={
                                                activeTimeframe === tf.id
                                                    ? {
                                                        background:
                                                            "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                                                    }
                                                    : {}
                                            }
                                        >
                                            {tf.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Metrics list */}
                                <div className="flex flex-col gap-0 w-full">
                                    {/* Downloads */}
                                    <div className="flex items-center justify-between h-[31.49px]">
                                        <div className="flex items-center gap-[13px]">
                                            <div className="w-[31.49px] h-[31.49px] flex items-center justify-center shrink-0">
                                                <Download
                                                    className="w-[18px] h-[22px]"
                                                    style={{
                                                        color: "transparent",
                                                        fill: "url(#blueGrad)",
                                                        stroke: "url(#blueGrad)",
                                                    }}
                                                />
                                                {/* SVG gradient trick via filter */}
                                                <svg width="0" height="0" className="absolute">
                                                    <defs>
                                                        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="3.24%" stopColor="#6CACDF" />
                                                            <stop offset="139.86%" stopColor="#0000FE" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                            </div>
                                            <span className="text-[16px] font-medium text-black leading-[21px] text-center">
                                                Downloads
                                            </span>
                                        </div>
                                        <span
                                            className="text-[22px] font-bold leading-[21px] text-center"
                                            style={{
                                                background:
                                                    "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                            }}
                                        >
                                            {(summary.downloads || 0).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full border-t border-[#F3F3F3]" />

                                    {/* Up Votes */}
                                    <div className="flex items-center justify-between h-[31.49px]">
                                        <div className="flex items-center gap-[13px]">
                                            <div className="w-[31.49px] h-[31.49px] flex items-center justify-center shrink-0">
                                                <ArrowUp className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="text-[16px] font-medium text-black leading-[21px] text-center">
                                                Up Votes
                                            </span>
                                        </div>
                                        <span
                                            className="text-[22px] font-bold leading-[21px] text-center"
                                            style={{
                                                background:
                                                    "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                            }}
                                        >
                                            {(summary.upvotes || 0).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full border-t border-[#F3F3F3]" />

                                    {/* Added To Frame */}
                                    <div className="flex items-center justify-between h-[31.49px]">
                                        <div className="flex items-center gap-[13px]">
                                            <div className="w-[31.49px] h-[31.49px] flex items-center justify-center shrink-0">
                                                <Layers className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="text-[16px] font-medium text-black leading-[21px] text-center">
                                                Added To Frame
                                            </span>
                                        </div>
                                        <span
                                            className="text-[22px] font-bold leading-[21px] text-center"
                                            style={{
                                                background:
                                                    "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                            }}
                                        >
                                            {(summary.framed || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Right: area chart ── */}
                            <div className="flex-1 relative overflow-hidden rounded-r-[12px] p-6">
                                {graphArray.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={graphArray}
                                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6CACDF" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#6CACDF" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorUpvotes" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorFramed" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,254,0.08)" />
                                            <XAxis dataKey="date" hide />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: "12px",
                                                    border: "none",
                                                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                                    fontWeight: "bold",
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="downloads"
                                                name="Downloads"
                                                stroke="#6CACDF"
                                                fillOpacity={1}
                                                fill="url(#colorDownloads)"
                                                strokeWidth={3}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="upvotes"
                                                name="Up Votes"
                                                stroke="#2563eb"
                                                fillOpacity={1}
                                                fill="url(#colorUpvotes)"
                                                strokeWidth={3}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="framed"
                                                name="Framed"
                                                stroke="#8b5cf6"
                                                fillOpacity={1}
                                                fill="url(#colorFramed)"
                                                strokeWidth={3}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full w-full text-gray-500 font-medium">
                                        No insights data available for this timeframe.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            <SaveModal
                isOpen={isSaveOpen}
                onClose={() => setIsSaveOpen(false)}
                post={currentPost}
                onEdit={() => setEditingPost(currentPost)}
                showEditOption={true}
                onDelete={() => setDeletingPostId(currentPostId)}
                showDeleteOption={true}
            />

            <DeleteConfirmModal
                isOpen={!!deletingPostId}
                onClose={() => setDeletingPostId(null)}
                onConfirm={handleDeleteConfirm}
                isPending={isDeleting}
            />

            <AnalyzingModal
                isOpen={analyzingModalOpen}
                status={analyzingModalStatus}
                onClose={() => setAnalyzingModalOpen(false)}
                reason={rejectionReason}
                aiDetection={aiDetection}
                humanDetection={humanDetection}
                editingDetection={editingDetection}
                onChangeImage={() => hiddenFileInputRef.current?.click()}
                setIsImage={() => { }}
            />

            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={hiddenFileInputRef}
                onChange={handleImageChange}
            />

            <EditPostModal
                post={editingPost}
                isOpen={!!editingPost}
                onClose={() => {
                    setEditingPost(null)
                    router.push("/Profile")
                }}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["post", currentPostId] });
                    showToast("Post updated successfully!");
                }}
            />
        </div>
    );
}