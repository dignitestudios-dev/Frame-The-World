"use client";

import React from "react";
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';

export default function MaintenancePage() {
  // Mapping your local images from public/images/
  const columnOne = [
    { image: "/images/1.jpg", name: "Design 01" },
    { image: "/images/2.jpg", name: "Design 02" },
    { image: "/images/3.jpg", name: "Design 03" },
    { image: "/images/4.jpg", name: "Design 04" },
  ];

  const columnTwo = [
    { image: "/images/3.jpg", name: "Design 03" },
    { image: "/images/4.jpg", name: "Design 04" },
    { image: "/images/1.jpg", name: "Design 01" },
    { image: "/images/2.jpg", name: "Design 02" },
  ];

  return (
    <main className="relative h-screen w-full overflow-hidden bg-white">
      {/* Required CSS for your InfiniteMovingCards vertical logic */}
      <style jsx global>{`
        @keyframes scroll-vertical {
          to {
            transform: translateY(calc(-50% - 0.75rem));
          }
        }
        .animate-scroll-vertical {
          animation: scroll-vertical var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite;
        }
      `}</style>

      {/* Background Layer: 3-Column Pinterest Flow */}
      <div className="absolute inset-0 z-0 flex justify-center gap-6 px-4 opacity-40">
        <InfiniteMovingCards
          items={columnOne}
          direction="top"
          speed="slow"
          orientation="vertical"
          className="w-full md:w-1/3"
        />
        <InfiniteMovingCards
          items={columnTwo}
          direction="bottom"
          speed="normal"
          orientation="vertical"
          className="hidden md:block md:w-1/3"
        />
        <InfiniteMovingCards
          items={columnOne}
          direction="top"
          speed="fast"
          orientation="vertical"
          className="hidden lg:block lg:w-1/3"
        />
      </div>

      {/* Content Layer: Glassmorphism effect */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center bg-white/50 backdrop-blur-2xl px-6 text-center">
        <div className="max-w-4xl">
          {/* Minimalist Logo/Icon */}
          <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-950 shadow-2xl">
            <div className="h-6 w-1 bg-white mx-0.5 animate-bounce" />
            <div className="h-8 w-1 bg-white mx-0.5 animate-bounce [animation-delay:0.2s]" />
            <div className="h-6 w-1 bg-white mx-0.5 animate-bounce [animation-delay:0.4s]" />
          </div>

          <h1 className="mb-6 text-5xl font-black tracking-tighter text-slate-950 md:text-8xl">
            Currently Under <br />
            <span className="text-rose-600">Maintenance</span>
          </h1>

          <div className="space-y-4">
            <p className="text-xl font-semibold text-slate-700 md:text-3xl">
              We’re behind the scenes fine-tuning things.
            </p>
            <p className="text-lg text-slate-500 md:text-xl">
              Please check back soon — we’re launching something beautiful.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <button className="w-full sm:w-auto rounded-full bg-slate-950 px-10 py-5 text-lg font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-2xl">
              Notify Me
            </button>
            <div className="flex items-center gap-3 px-6 py-4 rounded-full border border-slate-200 bg-white/80">
              <span className="flex h-3 w-3">
                <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-600">
                Live Updates
              </span>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Text */}
        <footer className="absolute bottom-12 w-full text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Coming Soon 2026
          </p>
        </footer>
      </div>
    </main>
  );
}