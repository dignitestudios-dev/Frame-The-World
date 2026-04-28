"use client";

import Image from "next/image";
import { Search, Bell, ArrowUp } from "lucide-react";
import Header from './../../components/global/header';
import { useState } from "react";

export default function TravelStoryPage() {
  const [activeTab, setActiveTab] = useState<"upvotes" | "framed">("upvotes");

  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      {/* Sticky Header */}
      <Header />
      <div className="min-h-screen bg-[#f6f7fb] px-6">
        <div className="mx-auto p-6">


          {/* ================= TOP 3 ================= */}
          <div className="mt-8 flex justify-center items-end gap-12">
            {/* #3 */}
            <TopUser
              rank={3}
              img="/images/3.jpg"
              name="Smith o neill"
              votes={900}
              size="sm"
            />

            {/* #1 */}
            <TopUser
              rank={1}
              img="/images/1.jpg"
              name="Leo Denzin"
              votes={1010}
              size="lg"
            />

            {/* #2 */}
            <TopUser
              rank={2}
              img="/images/2.jpg"
              name="Bradley Henry"
              votes={920}
              size="sm"
            />
          </div>

          {/* ================= SEGMENT ================= */}
          <div className="mt-8 flex justify-center">
            <div className="w-[340px] bg-[#eef1fb] rounded-full p-1 flex">
              <button
                onClick={() => setActiveTab("upvotes")}
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${activeTab === "upvotes"
                  ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white"
                  : "text-gray-500"
                  }`}
              >
                UpVotes
              </button>
              <button
                onClick={() => setActiveTab("framed")}
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${activeTab === "framed"
                  ? "bg-gradient-to-r from-[#6CACDF] to-[#0000FE] text-white"
                  : "text-gray-500"
                  }`}
              >
                Framed
              </button>
            </div>
          </div>

          {/* ================= TOP LIST ================= */}
          <div className="mt-4 max-w-2xl mx-auto p-6 space-y-3">
            {activeTab === "upvotes" ? (
              // UpVotes List
              [
                { id: "01", name: "Jenny Wilson", votes: 750 },
                { id: "02", name: "Daren", votes: 650 },
                { id: "03", name: "Michael Smith", votes: 600 },
                { id: "04", name: "Emily Johnson", votes: 590 },
                { id: "05", name: "Sophia Brown", votes: 500 },
              ].map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-gray-200 rounded-full"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-black w-6">{u.id}</span>

                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src="/images/1.jpg"
                        alt={u.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>

                    <span className="text-sm font-medium">{u.name}</span>
                  </div>

                  <div className="flex items-center gap-1 text-blue-500 font-semibold text-sm">
                    {u.votes}
                    <img src="/images/bxs_upvote.png" className="h-4" />
                  </div>
                </div>
              ))
            ) : (
              // Framed List
              [
                { id: "01", name: "Sarah Parker", votes: 820 },
                { id: "02", name: "James Wilson", votes: 780 },
                { id: "03", name: "Emma Davis", votes: 720 },
                { id: "04", name: "Oliver Brown", votes: 680 },
                { id: "05", name: "Ava Martinez", votes: 640 },
              ].map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-gray-200 rounded-full"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-black w-6">{u.id}</span>

                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src="/images/2.jpg"
                        alt={u.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>

                    <span className="text-sm font-medium">{u.name}</span>
                  </div>

                  <div className="flex items-center gap-1 text-blue-500 font-semibold text-sm">
                    {u.votes}
                    <img src="/images/image-icon.png" className="h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= TOP USER ================= */

function TopUser({
  rank,
  img,
  name,
  votes,
  size,
}: {
  rank: number;
  img: string;
  name: string;
  votes: number;
  size: "sm" | "lg";
}) {
  const avatarSize = size === "lg" ? 110 : 86;

  // Rank positioning logic
  const rankPosition =
    rank === 2
      ? "top-0 right-0 translate-x-1/4 -translate-y-1/4"
      : "top-0 left-0 -translate-x-1/4 -translate-y-1/4";

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ width: avatarSize, height: avatarSize }}
      >
        <Image
          src={img}
          alt={name}
          fill
          className="rounded-full object-cover ring-4 ring-blue-500"
        />

        {/* Rank bubble */}
        <div
          className={`absolute ${rankPosition} 
          h-9 w-6 rounded-xl bg-blue-500 text-white text-sm font-semibold 
          flex items-center justify-center`}
        >
          {rank}
        </div>
      </div>

      <p className="mt-4 text-sm font-medium">{name}</p>

      <div className="flex items-center gap-1 text-blue-500 text-sm font-semibold">
        {votes}
        <img src="/images/bxs_upvote.png" className="h-4" />
      </div>
    </div>
  );
}