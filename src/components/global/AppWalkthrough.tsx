"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const walkthroughContent = [
  {
    image: "/images/onboard.png",
    imageClassName: "object-cover",
    imageContainerClassName: "relative w-full h-full scale-125 -rotate-12 translate-y-[-10%]",
    title: "Explore Real Moments From\nReal Travelers",
    description: "Discover a huge gallery of authentic travel photos, clicked by verified travelers from around the world! No filters, no fakes, just pure beauty of nature.",
  },
  {
    id: "human-free",
    image: "/images/onboard2.png",
    imageClassName: "object-cover rounded-2xl",
    imageContainerClassName: "relative w-[85%] aspect-[9/16] rounded-3xl p-1 bg-white/20 backdrop-blur-sm shadow-2xl border border-white/30",
    title: "Authentic Travel Content",
    description: "Real, non-AI images only. No people, verified for clean, consistent destination content.",
  },
  {
    image: "/images/onboard3.png",
    imageClassName: "object-contain",
    imageContainerClassName: "relative w-[90%] h-full flex items-center justify-center",
    title: "Rise to the Top of the Leaderboard",
    description: "Earn upvotes, downloads, and frame-adds to climb the ranks. Share your best shots and get recognized by travelers worldwide.",
  },
  {
    image: "/images/onboard4.png",
    imageClassName: "object-contain",
    imageContainerClassName: "relative w-[90%] h-full flex items-center justify-center",
    title: "Create Your Own Unique Frame",
    description: "Collect your favorite photos from other travelers and add them to your own themed frames like a personal gallery for beaches, mountains, or hidden gems.",
  },

];

export default function AppWalkthrough() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(1);

  const totalSteps = walkthroughContent.length;
  const currentContent = walkthroughContent[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      {/* Main Onboarding Card */}
      <div className="relative w-full max-w-[28em] h-[90vh] md:h-[800px] z-10 overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-gradient-to-b from-[#6CACDF] to-[#0000FE] flex flex-col">

        {/* Top Image/Content Section */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden p-8">

          <div key={currentStep} className={`animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700 flex items-center justify-center h-full w-full`}>
            <div className={currentContent.imageContainerClassName}>
              <Image
                src={currentContent.image || ""}
                alt="walkthrough"
                fill
                className={currentContent.imageClassName}
                priority
              />
            </div>
          </div>

        </div>

        {/* Bottom Info Section */}
        <div className="relative bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md rounded-t-[3rem] p-10 pb-12">
          {/* Pagination Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 transition-all duration-500 rounded-full ${index === currentStep
                  ? "w-8 bg-green-400"
                  : "w-2 bg-white/40"
                  }`}
              />
            ))}
          </div>

          {/* Text Content */}
          <div key={`text-${currentStep}`} className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-center">
            <h1 className={`text-2xl font-black text-white mb-3 leading-[1.1] tracking-tight whitespace-pre-line`}>
              {currentContent.title}
            </h1>
            <p className="text-white/80 text-[13px] leading-relaxed font-medium mb-10 px-4">
              {currentContent.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={handleNext}
              className="w-[10em] rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-black hover:from-green-500 hover:via-green-600 hover:to-green-700 h-12 font-semibold shadow-lg"
            >
              {currentStep < totalSteps - 1 ? "Next" : "Repeat"}
            </Button>
          </div>

          {/* Skip Button (only if not on subscription step) */}
          {/* {currentStep < totalSteps - 1 && (
            <button
              onClick={() => setCurrentStep(totalSteps - 1)}
              className="absolute top-10 right-8 text-white/50 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              Skip
            </button>
          )} */}
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[10rem]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[10rem]"></div>
      </div>
    </div>
  );
}