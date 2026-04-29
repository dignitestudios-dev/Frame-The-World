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

// ─── Default graph data per timeframe ────────────────────────────────────────
const getDefaultGraphData = (timeframe: string) => {
    switch (timeframe) {
        case "24h":
            return ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"].map(
                (date) => ({ date, downloads: 0, upvotes: 0, framed: 0 })
            );
        case "week":
            return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((date) => ({
                date, downloads: 0, upvotes: 0, framed: 0,
            }));
        case "month":
            return [1, 6, 11, 16, 21, 26, 30].map((day) => ({
                date: `${day}`, downloads: 0, upvotes: 0, framed: 0,
            }));
        case "year":
            return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                (date) => ({ date, downloads: 0, upvotes: 0, framed: 0 })
            );
        default:
            return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((date) => ({
                date, downloads: 0, upvotes: 0, framed: 0,
            }));
    }
};

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
    const [isInsightsOpen, setIsInsightsOpen] = useState(false); // ← new state

    // ── Insights query ──────────────────────────────────────────────────────────
    const { data: insightsData, isLoading: isLoadingInsights } = useInsightsQuery({
        queryKey: ["postInsights", currentPostId, activeTimeframe],
        queryFn: () => getPostInsightsApi(currentPostId, activeTimeframe),
        enabled: !!currentPostId,
    });

    const rawData = insightsData?.data || insightsData;
    const summary = rawData?.summary || { downloads: 0, upvotes: 0, framed: 0 };
    const apiGraph = rawData?.graph || [];

    // Merge API data into fixed default labels with normalization and bucketing
    const graphArray = getDefaultGraphData(activeTimeframe).map((item) => {
        const matches = apiGraph.filter((apiItem: any) => {
            const apiDate = String(apiItem.date).trim();
            const labelDate = String(item.date).trim();

            if (activeTimeframe === "24h") {
                const apiHour = parseInt(apiDate.split(":")[0]);
                const labelHour = parseInt(labelDate);
                // Bucket two hours into one label (e.g., 00 and 01 map to "00")
                return apiHour === labelHour || apiHour === labelHour + 1;
            }

            if (activeTimeframe === "month") {
                const apiDay = parseInt(apiDate);
                const labelDay = parseInt(labelDate);
                // Map days to the nearest lower label bucket (1-5, 6-10, etc.)
                if (labelDay === 30) return apiDay >= 30;
                return apiDay >= labelDay && apiDay < labelDay + 5;
            }

            if (activeTimeframe === "year") {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                // Handle "YYYY-MM" format (e.g., "2026-04")
                if (apiDate.includes("-")) {
                    const parts = apiDate.split("-");
                    const monthNum = parseInt(parts[parts.length - 1]);
                    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
                        return monthNames[monthNum - 1] === labelDate;
                    }
                }
                return apiDate.toLowerCase().startsWith(labelDate.toLowerCase());
            }

            if (activeTimeframe === "week") {
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                if (apiDate.includes("-")) {
                    const dateObj = new Date(apiDate);
                    if (!isNaN(dateObj.getTime())) {
                        const dayName = dayNames[dateObj.getUTCDay()];
                        return dayName === labelDate;
                    }
                }
                return apiDate.toLowerCase().startsWith(labelDate.toLowerCase());
            }

            return apiDate === labelDate;
        });

        if (matches.length > 0) {
            return {
                ...item,
                downloads: matches.reduce((sum: number, m: any) => sum + (m.downloads || 0), 0),
                upvotes: matches.reduce((sum: number, m: any) => sum + (m.upvotes || 0), 0),
                framed: matches.reduce((sum: number, m: any) => sum + (m.framed || 0), 0),
            };
        }
        return item;
    });

    console.log(currentPost, "post-categories");

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
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 rounded-[32px]" />
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
                                ? currentPost.categories.map((c: any) => `${c?.name || c}`).join(", ")
                                : ""}
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

                        {/* Analytics → opens InsightsModal */}
                        <button
                            type="button"
                            onClick={() => setIsInsightsOpen(true)} // ← wired up
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
                                                background: "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                            }}
                                        >
                                            {(summary.downloads || 0).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="w-full border-t border-[#F3F3F3]" />

                                    {/* Upvotes */}
                                    <div className="flex items-center justify-between h-[31.49px]">
                                        <div className="flex items-center gap-[13px]">
                                            <div className="w-[31.49px] h-[31.49px] flex items-center justify-center shrink-0">
                                                <ArrowUp className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="text-[16px] font-medium text-black leading-[21px] text-center">
                                                Upvotes
                                            </span>
                                        </div>
                                        <span
                                            className="text-[22px] font-bold leading-[21px] text-center"
                                            style={{
                                                background: "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                            }}
                                        >
                                            {(summary.upvotes || 0).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="w-full border-t border-[#F3F3F3]" />

                                    {/* Framed */}
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
                                                background: "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
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

                            {/* ── Right: Area Chart ── */}
                            <div className="flex-1 relative overflow-hidden rounded-r-[12px] p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={graphArray}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#818CF8" stopOpacity={0.5} />
                                                <stop offset="100%" stopColor="#818CF8" stopOpacity={0.05} />
                                            </linearGradient>
                                            <linearGradient id="colorUpvotes" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6CACDF" stopOpacity={0.5} />
                                                <stop offset="100%" stopColor="#6CACDF" stopOpacity={0.05} />
                                            </linearGradient>
                                            <linearGradient id="colorFramed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#00a1feff" stopOpacity={0.35} />
                                                <stop offset="100%" stopColor="#007ffeff" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,254,0.06)" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }}
                                            dy={10}
                                            interval={0}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "12px",
                                                border: "none",
                                                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                background: "white",
                                                padding: "8px 12px",
                                            }}
                                            cursor={{ stroke: "rgba(0,0,254,0.15)", strokeWidth: 1 }}
                                        />
                                        <Area type="monotone" dataKey="framed" name="Framed" stroke="#0098feff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFramed)" dot={false} activeDot={false} isAnimationActive={false} />
                                        <Area type="monotone" dataKey="upvotes" name="Upvotes" stroke="#6CACDF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUpvotes)" dot={false} activeDot={false} isAnimationActive={false} />
                                        <Area type="monotone" dataKey="downloads" name="Downloads" stroke="#818CF8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDownloads)" dot={false} activeDot={false} isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
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
                onClose={() => {
                    setAnalyzingModalOpen(false);
                    router.push("/Profile");
                }}
                reason={rejectionReason}
                aiDetection={aiDetection}
                humanDetection={humanDetection}
                editingDetection={editingDetection}
                postId={currentPostId || undefined}
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
                    setEditingPost(null);
                    router.push("/Profile");
                }}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["post", currentPostId] });
                    showToast("Post updated successfully!");
                }}
            />

        </div>
    );
}