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
  const [activeTimeframe, setActiveTimeframe] = useState("24h");

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
  const width = 440;
  const height = 140;
  const maxVal = Math.max(
    ...graphArray.map((i: any) => Math.max(i.downloads || 0, i.upvotes || 0, i.framed || 0)),
    5
  );

  const getPoints = (key: string) => {
    const vals = graphArray.map((item: any) => item[key] || 0);
    return vals.length === 0 ? [0, 0] : vals.length === 1 ? [vals[0], vals[0]] : vals;
  };

  const downloadsPoints = getPoints("downloads");
  const upvotesPoints = getPoints("upvotes");
  const framedPoints = getPoints("framed");

  const stepX = width / (downloadsPoints.length - 1 || 1);

  const getSmoothPath = (points: number[]) => {
    if (points.length < 1) return "";
    return points.reduce((acc, val, i) => {
      const x = i * stepX;
      const y = height - (val / maxVal) * height;
      if (i === 0) return `M ${x} ${y}`;
      
      const prevX = (i - 1) * stepX;
      const prevY = height - (points[i - 1] / maxVal) * height;
      const cp1x = prevX + (x - prevX) / 2;
      const cp2x = prevX + (x - prevX) / 2;
      
      return `${acc} C ${cp1x} ${prevY}, ${cp2x} ${y}, ${x} ${y}`;
    }, "");
  };

  const metrics = [
    { key: "downloads", label: "Downloads", color: "#3b82f6", points: downloadsPoints },
    { key: "upvotes", label: "Upvotes", color: "#10b981", points: upvotesPoints },
    { key: "framed", label: "Framed", color: "#8b5cf6", points: framedPoints },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full absolute top-[7%] px-3 py-4 max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
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
            <div className="grid grid-cols-1 gap-1">
              <StatItem
                icon={<Download className="w-4 h-4 text-blue-600" />}
                label="Total Downloads"
                value={summary.downloads || 0}
              />
              <div className="h-px bg-gray-50 mx-4" />
              <StatItem
                icon={<ArrowUp className="w-4 h-4 text-emerald-600" />}
                label="Total Upvotes"
                value={summary.upvotes || 0}
              />
              <div className="h-px bg-gray-50 mx-4" />
              <StatItem
                icon={<Layers className="w-4 h-4 text-violet-600" />}
                label="Times Framed"
                value={summary.framed || 0}
              />
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-900">Performance Trend</h3>
                <div className="flex gap-3">
                  {metrics.map((m) => (
                    <div key={m.key} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative h-[160px] w-full">
                {/* Y-Axis Grid */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-px bg-gray-100" />
                  ))}
                </div>

                <div className="absolute inset-x-0 top-0 bottom-6">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-aspect-ratio-none overflow-visible">
                    {/* Vertical Grid Lines */}
                    {graphArray.map((_: any, i: number) => (
                      <line
                        key={i}
                        x1={i * stepX}
                        y1={0}
                        x2={i * stepX}
                        y2={height}
                        stroke="#f3f4f6"
                        strokeWidth="1"
                      />
                    ))}

                    {metrics.map((m) => {
                      const path = getSmoothPath(m.points);
                      return (
                        <g key={m.key}>
                          <path
                            d={path}
                            fill="none"
                            stroke={m.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                          />
                          {m.points.map((val: number, i: number) => (
                            <circle
                              key={i}
                              cx={i * stepX}
                              cy={height - (val / maxVal) * height}
                              r="3.5"
                              fill="white"
                              stroke={m.color}
                              strokeWidth="2"
                            />
                          ))}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* X-Axis Labels */}
                <div className="absolute bottom-0 inset-x-0 flex justify-between">
                  {graphArray.map((item: any, i: number) => (
                    <span key={i} className="text-[10px] font-bold text-gray-400">
                      {item.date}
                    </span>
                  ))}
                </div>
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
