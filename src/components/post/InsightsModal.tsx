"use client";

import React, { useState, useEffect } from "react";
import { X, Download, ArrowUp, Layers, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPostInsightsApi } from "@/services/postApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

// ─── Default fallback data per timeframe ───────────────────────────────────
const getDefaultGraphData = (timeframe: string) => {
  switch (timeframe) {
    case "24h":
      // 00 02 04 06 08 10 12 14 16 18 20 22
      return ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"].map(
        (date) => ({ date, downloads: 0, upvotes: 0, framed: 0 })
      );

    case "week":
      // Mon Tue Wed Thu Fri Sat Sun
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((date) => ({
        date,
        downloads: 0,
        upvotes: 0,
        framed: 0,
      }));

    case "month":
      // 1 6 11 16 21 26 30
      return [1, 6, 11, 16, 21, 26, 30].map((day) => ({
        date: `${day}`,
        downloads: 0,
        upvotes: 0,
        framed: 0,
      }));

    case "year":
      // Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
        (date) => ({ date, downloads: 0, upvotes: 0, framed: 0 })
      );

    default:
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((date) => ({
        date,
        downloads: 0,
        upvotes: 0,
        framed: 0,
      }));
  }
};

// ─── Custom Tooltip ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-500 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600 font-medium capitalize">{entry.name}:</span>
          <span className="font-black" style={{ color: entry.color }}>
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Custom Legend ─────────────────────────────────────────────────────────
const CustomLegend = ({ payload }: any) => (
  <div className="flex gap-4 justify-end">
    {payload?.map((entry: any) => (
      <div key={entry.value} className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-[10px] font-bold text-gray-400 uppercase">{entry.value}</span>
      </div>
    ))}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────
const InsightsModal: React.FC<InsightsModalProps> = ({ postId, isOpen, onClose }) => {
  const [activeTimeframe, setActiveTimeframe] = useState("24h");

  const { data: insightsData, isLoading, refetch } = useQuery({
    queryKey: ["postInsights", postId, activeTimeframe],
    queryFn: () => getPostInsightsApi(postId, activeTimeframe),
    enabled: isOpen && !!postId,
  });

  useEffect(() => {
    if (isOpen) refetch();
  }, [isOpen, activeTimeframe, refetch]);

  if (!isOpen) return null;

  const rawData = insightsData?.data || insightsData;
  const summary = rawData?.summary || { downloads: 0, upvotes: 0, framed: 0 };

  let graphArray = rawData?.graph || [];
  if (graphArray.length === 0) {
    graphArray = getDefaultGraphData(activeTimeframe);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full absolute top-[7%] px-3 py-4 max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="mx-auto w-12 h-1 bg-gray-900/10 rounded-full mb-4" />

        {/* Header */}
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
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              Fetching Insights...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
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

            {/* Chart */}
            <div className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900">Performance Trend</h3>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={graphArray}
                  margin={{ top: 8, right: 8, left: -28, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="0"
                    stroke="#f3f4f6"
                    vertical={true}
                    horizontal={true}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}          // ← show ALL labels, no skipping
                    padding={{ left: 8, right: 8 }}
                  />

                  <YAxis
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#d1d5db" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={36}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Legend
                    content={<CustomLegend />}
                    wrapperStyle={{ paddingTop: 12 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="downloads"
                    name="Downloads"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "#fff", stroke: "#3b82f6", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "#3b82f6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="upvotes"
                    name="Upvotes"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "#fff", stroke: "#10b981", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "#10b981" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="framed"
                    name="Framed"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "#fff", stroke: "#8b5cf6", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Stat Row ──────────────────────────────────────────────────────────────
const StatItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
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