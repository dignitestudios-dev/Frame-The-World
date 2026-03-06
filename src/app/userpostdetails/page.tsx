"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  ArrowLeft, 
  Download, 
  BarChart2, 
  MoreVertical, 
  ThumbsUp, 
  Layers 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/global/header";
import OptionsModal from "@/components/global/OptionsModal"; 


export default function ProfileDetails() {
  const router = useRouter();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans">
      <Header />

      {/* OPTIONS MODAL */}
      <OptionsModal 
        isOpen={isOptionsOpen} 
        onClose={() => setIsOptionsOpen(false)} 
      />

      <main className="max-w-[1400px] mx-auto py-8">
        
        {/* HERO IMAGE CONTAINER */}
        <div className="relative w-full h-[500px] rounded-[40px] overflow-hidden bg-slate-900 shadow-2xl">
          <Image
            src="/images/1.jpg" 
            alt="Mountain Mist"
            fill
            priority
            className="object-cover opacity-90"
          />

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* TITLE + ACTIONS */}
        <div className="flex items-start justify-between mt-8 px-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Eiffel Tower</h2>
            <p className="text-[13px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="opacity-70">📍</span> Paris, France
            </p>
            <p className="text-[12px] text-slate-400 mt-1 font-medium italic">
              #Eiffel, #Tower, #Paris, #History
            </p>
          </div>

          <div className="flex gap-2">
            <button className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#6CACDF] to-[#0000FE] hover:opacity-90 flex items-center justify-center shadow-md transition-all active:scale-95">
              <Download className="w-5 h-5 text-white" />
            </button>
            <button className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#6CACDF] to-[#0000FE] hover:opacity-90 flex items-center justify-center shadow-md transition-all active:scale-95">
              <BarChart2 className="w-5 h-5 text-white" />
            </button>
            
            {/* TRIGGER BUTTON: Opens the Modal */}
            <button 
              onClick={() => setIsOptionsOpen(true)}
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#6CACDF] to-[#0000FE] hover:opacity-90 flex items-center justify-center shadow-md transition-all active:scale-95"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* ================= PERFORMANCE SUMMARY ================= */}
        <div className="mt-12 px-2">
          <h3 className="text-[26px] font-bold text-slate-800 mb-6">
            Average Performance Summary
          </h3>

          <div className="bg-[#e8edff] rounded-[13.37px] overflow-hidden flex flex-col lg:flex-row min-h-[280px]">
            
            {/* STATS PANEL */}
            <div className="p-6 pb-16 lg:w-[400px] flex flex-col justify-between">
              {/* Time Filters */}
              <div className="flex gap-2">
                {['24h', 'Week', 'Monthly', 'Year'].map((label, i) => (
                  <button 
                    key={label}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                      i === 0 ? 'bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white' : 'bg-white/60 text-slate-500 hover:bg-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Stats Rows */}
              <div className="space-y-5">
                {[
                  { label: "Downloads", value: 420, icon: <Download size={16}/> },
                  { label: "Up Votes", value: 350, icon: <ThumbsUp size={16}/> },
                  { label: "Added To Frame", value: 295, icon: <Layers size={16}/> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="text-[#4c6ef5] opacity-80">{item.icon}</div>
                      <span className="text-[14px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[16px] font-bold text-[#4c6ef5]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART AREA */}
            <div className="relative flex-1 bg-gradient-to-br from-transparent to-[#dbe4ff]/50 flex items-end">
              <svg
                viewBox="0 0 1000 300"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#748ffc" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#748ffc" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Visual Area Path */}
                <path
                  d="M0,250 C150,220 200,100 300,150 C400,200 500,50 650,120 C800,190 900,100 1000,180 V300 H0 Z"
                  fill="url(#chartGradient)"
                />
                {/* Line Path */}
                <path
                  d="M0,250 C150,220 200,100 300,150 C400,200 500,50 650,120 C800,190 900,100 1000,180"
                  fill="none"
                  stroke="#4c6ef5"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Grid Lines Overlay */}
              <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-10">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="border-r border-slate-900 h-full" />
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}