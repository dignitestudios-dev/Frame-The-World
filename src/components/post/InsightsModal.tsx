"use client";

import React, { useState, useEffect } from "react";
import { X, Download, ArrowUp, Layers, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPostInsightsApi } from "@/services/postApi";

interface InsightsModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const timeframes = [
  { id: "24h", label: "24h" },
  { id: "week", label: "Week" },
  { id: "month", label: "Monthly" },
  { id: "year", label: "Year" },
];

const InsightsModal: React.FC<InsightsModalProps> = ({ postId, isOpen, onClose }) => {
  const [activeTimeframe, setActiveTimeframe] = useState("week");

  const { data: insightsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["postInsights", postId, activeTimeframe],
    queryFn: () => getPostInsightsApi(postId, activeTimeframe),
    enabled: isOpen && !!postId,
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, activeTimeframe, refetch]);

  if (!isOpen) return null;

  const rawData = insightsData?.data || insightsData;
  const summary = rawData?.summary || { downloads: 0, upvotes: 0, framed: 0 };
  const graphArray = rawData?.graph || [];

  // SVG Graph Logic
  // Sum engagement metrics for graph points
  const graphDataPoints = graphArray.length > 0
    ? graphArray.map((item: any) => (item.downloads || 0) + (item.upvotes || 0) + (item.framed || 0))
    : [0, 0]; // Fallback

  const graphPoints = graphDataPoints.length === 1
    ? [graphDataPoints[0], graphDataPoints[0]] // Duplicate if only 1 point
    : graphDataPoints;

  const maxVal = Math.max(...graphPoints, 10);
  const width = 400;
  const height = 120; // Shorter graph for compactness
  const stepX = width / (graphPoints.length - 1 || 1);

  const pathContent = graphPoints.reduce((acc: string, val: number, i: number) => {
    const x = i * stepX;
    const y = height - (val / maxVal) * height;
    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, "");

  const areaPath = `${pathContent} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full absolute top-[7%] px-3 py-4 max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle for Mobile Look */}
        <div className="mx-auto w-12 h-1 bg-gray-900/10 rounded-full mb-4"></div>

        <div className="flex items-center justify-center mb-6 relative">
          <h2 className="text-xl font-bold text-gray-900">Insights</h2>
          <button
            onClick={onClose}
            className="absolute right-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-full mb-6">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setActiveTimeframe(tf.id)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${activeTimeframe === tf.id
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-600"
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Fetching Insights...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats List */}
            <div className="grid grid-cols-1 gap-1">
              <StatItem
                icon={<Download className="w-4 h-4 text-blue-600" />}
                label="Downloads"
                value={summary.downloads || 0}
              />
              <div className="h-px bg-gray-50 mx-4" />
              <StatItem
                icon={<ArrowUp className="w-4 h-4 text-blue-600" />}
                label="Up Votes"
                value={summary.upvotes || 0}
              />
              <div className="h-px bg-gray-50 mx-4" />
              <StatItem
                icon={<Layers className="w-4 h-4 text-blue-600" />}
                label="Added To Frame"
                value={summary.framed || summary.addedToFrame || 0}
              />
            </div>

            {/* Performance Graph */}
            <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 rounded-[24px] p-4 border border-blue-100/50">
              <h3 className="text-center text-xs font-bold text-gray-900 mb-4">Average Performance Summary</h3>

              <div className="relative h-[120px] w-full overflow-hidden">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-[0.03]">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-px bg-blue-900" />
                  ))}
                </div>

                {/* SVG Graph */}
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-aspect-ratio-none overflow-visible">
                  <defs>
                    <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Area */}
                  <path d={areaPath} fill="url(#graphGradient)" />

                  {/* Line */}
                  <path
                    d={pathContent}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_2px_4px_rgba(59,130,246,0.3)]"
                  />

                  {/* Points (dots) for better visibility if only few points */}
                  {graphPoints.length < 5 && graphPoints.map((val: number, i: number) => (
                    <circle
                      key={i}
                      cx={i * stepX}
                      cy={height - (val / maxVal) * height}
                      r="3.5"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
  <div className="flex items-center justify-between px-3 py-2">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-xs font-bold text-gray-900">{label}</span>
    </div>
    <span className="text-lg font-black text-blue-600">{value.toLocaleString()}</span>
  </div>
);

export default InsightsModal;
