

  "use client";

import Image from "next/image";
import { useState } from "react";

import { Bookmark, Grid, Image as ImageIcon, Lock, LockIcon } from "lucide-react";
import Header from "@/components/global/header";
import { useRouter } from "next/navigation";

export default function TravelStoryPage() {
 const [activeTab, setActiveTab] = useState<"posts" | "frames" | "space">(
    "posts"
  );
  const [frameVisibility, setFrameVisibility] = useState("public");
  const router = useRouter();


  const isFrames = activeTab === "frames";
  const isPosts = activeTab === "posts";
    const isSpace = activeTab === "space";

const badges = [
  "/images/badge1.png",
  "/images/badge2.png",
  "/images/badge3.png",
  "/images/badge4.png",
];

  return (
      <div className="min-h-screen bg-white text-[#1a1a1a] font-sans">
          <Header />
    <div className="min-h-screen bg-white px-8 py-10 font-sans text-[#1a1a1a]">
      
      
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12">
        
        {/* ================= LEFT PROFILE CARD ================= */}
    <aside className="relative sticky top-20 bg-[#f1f3f6] rounded-[30px] p-8 overflow-hidden shadow-sm h-fit">
  {/* 1. Background Graph (No Grid) */}
  <div className="absolute top-0 left-0 w-full h-56 pointer-events-none">
    <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
      <defs>
        <radialGradient id="peakGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Soft Blue Glows at the High Peaks */}
      <circle cx="80" cy="50" r="60" fill="url(#peakGlow)" />
      <circle cx="310" cy="80" r="50" fill="url(#peakGlow)" />

      {/* The Line Graph - Adjusted to match the reference image zig-zag */}
      <path
        d="M -10 130 L 30 130 L 80 50 L 140 160 L 190 110 L 250 110 L 310 80 L 350 140 L 410 140"
        fill="none"
        stroke="#4f46e5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-40"
      />

      {/* Data Dots positioned on the line vertices */}
      {[
        {x: 30, y: 130}, {x: 80, y: 50}, {x: 140, y: 160}, 
        {x: 190, y: 110}, {x: 250, y: 110}, {x: 310, y: 80}, 
        {x: 350, y: 140}
      ].map((dot, i) => (
        <circle key={i} cx={dot.x} cy={dot.y} r="4.5" fill="#3b82f6" />
      ))}
    </svg>
  </div>

  {/* 2. Profile Content */}
  <div className="relative z-10 flex flex-col items-center">
    
    {/* Avatar with Squircle Border */}
    <div className="relative w-36 h-36 flex items-center justify-center">
        <div className="absolute inset-0 rounded-[55px] bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_10px_20px_rgba(59,130,246,0.3)]" />
        <div className="relative w-[92%] h-[92%] rounded-[50px] bg-[#f1f3f6] p-1 flex items-center justify-center">
            <div className="relative w-full h-full rounded-[45px] overflow-hidden">
                <Image
                  src="/images/1.jpg"
                  alt="Leo Denzin"
                  fill
                  className="object-cover"
                />
            </div>
        </div>
    </div>

    <h2 className="mt-6 text-2xl font-bold text-[#1a1a1a]">Leo Denzin</h2>
    <p className="text-[13px] text-gray-500 mt-2 px-6 leading-relaxed text-center font-medium">
      Lorem ipsum dolor sit amet consectetur. Dis malesuada
      mauris pellentesque eget tellus amet a massa.
    </p>

    <div className="mt-4 text-center">
      <p className="text-sm font-bold text-gray-800">Travel Mania</p>
      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Miami, FL</p>
    </div>

    {/* Stats Section */}
    <div className="grid grid-cols-4 gap-2 w-full mt-8">
      {[
        { label: "Up votes", value: 350 },
        { label: "Framed", value: 32 },
        { label: "Posts", value: 64 },
        { label: "Frames", value: 64 },
      ].map((s) => (
        <div key={s.label} className="flex flex-col items-center">
          <p className="text-[#4f46e5] text-xl font-black">{s.value}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{s.label}</p>
        </div>
      ))}
    </div>

    {/* 3. Achievements Section (Restored Badges) */}
    <div className="w-full mt-10">
      <h3 className="text-xl font-bold mb-6 text-gray-900 text-left w-full">Achievements</h3>
      <div className="grid grid-cols-4 gap-y-6 gap-x-2">
        {[...Array(6)].map((_, i) => {
          const isUnlocked = i < badges.length;
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-12">
                <Image
                  src={isUnlocked ? badges[i] : "/images/badge4.png"}
                  alt={isUnlocked ? `Badge ${i + 1}` : "Locked badge"}
                  fill
                  className={`object-contain ${!isUnlocked && "opacity-40"}`}
                />
              </div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter text-center">
                {isUnlocked ? "Badge name" : "Locked"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</aside>
        {/* ================= RIGHT CONTENT AREA ================= */}
       {/* ================= RIGHT CONTENT ================= */}
        <section>
         <div className="bg-[#e2e8f7] rounded-full flex mb-10 shadow-sm">
  <button
    onClick={() => setActiveTab("posts")}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition
      ${
        isPosts
          ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white shadow-md"
          : "text-gray-400 hover:text-blue-500"
      }`}
  >
    <div className="relative w-4 h-4">
      <Image
        src="/images/posts.png"
        alt="Posts"
        fill
        className="object-contain"
      />
    </div>
    Posts
  </button>

  <button
    onClick={() => setActiveTab("frames")}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition
      ${
        isFrames
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
          : "text-gray-400 hover:text-blue-500"
      }`}
  >
    <div className="relative w-4 h-4">
      <Image
        src="/images/frames.png"
        alt="Frames"
        fill
        className="object-contain"
      />
    </div>
    Frames
  </button>

  <button
    onClick={() => setActiveTab("space")}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition
      ${
        activeTab === "space"
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
          : "text-gray-400 hover:text-blue-500"
      }`}
  >
    <div className="relative w-4 h-4">
      <Image
        src="/images/lock.png"
        alt="My Space"
        fill
        className={`object-contain ${
          activeTab === "space" ? "opacity-100" : "opacity-60"
        }`}
      />
    </div>
    My Space
  </button>
</div>

          {/* ================= POSTS GRID ================= */}
          {isPosts && (
            <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[120px] gap-6">
              {Array.from({ length: 20 }).map((_, i) => {
                const isTall = i % 3 === 0 || i % 2 === 0;

                return (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl
                      ${isTall ? "row-span-3" : "row-span-2"}`}
                  >
                    <Image
                      src={`/images/${(i % 4) + 1}.jpg`}
                      alt="Travel"
                      fill
                      className="object-cover cursor-pointer"
        onClick={() => router.push("/postdetails")}
                    />
                    {/* <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow">
                      <Bookmark className="h-4 w-4 text-gray-700" />
                    </button> */}
                  </div>
                );
              })}
            </div>
          )}
{/* ================= FRAMES GRID ================= */}
{isFrames && (
  <div className="pl-2">

    {/* 🔘 PUBLIC / PRIVATE PILLS */}
    <div className="flex gap-3 justify-center mb-6">
      <button
        onClick={() => setFrameVisibility("public")}
        className={`px-5 py-2 rounded-full text-sm  transition
          ${
            frameVisibility === "public"
              ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white shadow-md"
              : "bg-blue-100 text-gray-400 border border-gray-200 hover:text-black"
          }`}
      >
        Public
      </button>

      <button
        onClick={() => setFrameVisibility("private")}
        className={`px-5 py-2 rounded-full text-sm transition
          ${
            frameVisibility === "private"
              ? "bg-gradient-to-r  from-[#6CACDF] to-[#0000FE] text-white shadow-md"
              : "bg-blue-100 text-gray-400 border border-gray-200 hover:text-black"
          }`}
      >
        Private
      </button>
    </div>

    {/* 🖼️ FRAMES GRID */}
   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
  {Array.from({ length: 12 }).map((_, i) => (
    <div key={i} className="flex flex-col items-center">
      
      {/* Frame Card */}
      <div
        className="relative overflow-hidden rounded-[49.26px]
        shadow-[0_10px_25px_rgba(0,0,0,0.35)]
        w-[200px] h-[200px]"
      >
        <Image
          src={`/images/${(i % 4) + 1}.jpg`}
          alt="Frame"
          fill
          className="object-cover cursor-pointer"
                  onClick={() => router.push("/framedetails")}

        />

        <div className="absolute inset-6 rounded-[40px] border-4 border-black/40 overflow-hidden">
          <Image
            src={`/images/${((i + 1) % 4) + 1}.jpg`}
            alt="Inner Frame"
            fill
            className="object-cover opacity-90"
          />
        </div>

        <div className="absolute inset-0 shadow-[inset_0_0_0_8px_rgba(0,0,0,0.35)] rounded-[49.26px]" />

        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <div className="relative w-[170px] h-[170px] rounded-[30px] overflow-hidden border border-white/20">
            <Image
              src={`/images/${((i + 2) % 4) + 1}.jpg`}
              alt="Mini"
              fill
              className="object-cover opacity-80"
            />
          </div>
        </div>

        {/* Optional: Keep only the count inside */}
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div                       onClick={() => router.push("/privateframes")}
 className="text-3xl font-bold pt-20 cursor-pointer">15+</div>
        </div>
      </div>

      {/* Frame Name BELOW */}
      <div className="mt-4 text-center">
        <div  className="text-[16px] font-semibold text-gray-800">
          Frame Name
        </div>
      
      </div>

    </div>
  ))}
</div>

  </div>
)}



          {/* ================= FRAMES GRID ================= */}
     {isSpace && (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pl-2">
    {Array.from({ length: 12 }).map((_, i) => {
      const frameNumber = (i % 4) + 1;
      const frameName = `Frame ${i + 1}`;

      return (
        <div key={i} className="flex flex-col items-center">
          
          {/* Image Card */}
          <div
            className="relative overflow-hidden rounded-[24px]
              shadow-[0_10px_25px_rgba(0,0,0,0.35)]
              w-[200px] h-[200px]"
                                    onClick={() => router.push("/framedetails")}

          >
            <Image
              src={`/images/${frameNumber}.jpg`}
              alt={frameName}
              fill
              className="object-cover cursor-pointer"

            />

            {/* LOCK ICON */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/30 shadow-3xl">
                <LockIcon className="text-white w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Frame Name */}
          <p className="mt-3 text-sm font-semibold text-black text-center">
            Frame Name
          </p>

        </div>
      );
    })}
  </div>
)}

        </section>
      </div>
    </div>
    </div>
  );
}