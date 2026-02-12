"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const walkthroughContent = [
  {
    image: "/images/onboard.png",
    imageClassName: "object-cover grayscale ml-[0em] -mt-[10em]",
    imageStyle: { transform: `rotate(-30deg)` },
    imageWidth: undefined, // Set custom width or leave undefined to use fill
    imageHeight: undefined, // Set custom height or leave undefined to use fill
    title: "Explore Real Moments From\nReal Travelers",
    description: "Discover a huge gallery of authentic travel photos, clicked by verified travelers from around the world! No filters, no fakes, just pure beauty of nature.",
  },
  {
    image: "/images/onboard2.png",
    imageClassName: "object-contain grayscale ml-[0em] h-20 w-20",
    imageWidth: 800,
    imageHeight: 800,
    title: "100% Human-Free, AI-Free, Manipulation-Free",
    description: "Our AI ensures every picture is or  iginal, no humans, no AI-generated images, You can even use the AI tool to remove humans from your own clicks before posting.",
  },    
  {
    image: "/images/onboard3.png",
    imageClassName: "object-contain grayscale ",
    imageWidth: undefined,
    imageHeight: undefined,
    title: "Rise to the Top of the Leaderboard",
    description: "Earn upvotes, downloads, and frame-adds to climb the ranks. Share your best shots and get recognized by travelers worldwide.",
  },
  {
    image: "/images/onboard4.png",
    imageClassName: "object-contain grayscale",
    imageWidth: 300,
    imageHeight: 300,
    title: "Create Your Own Unique Frame",
    description: "Collect your favorite photos from other travelers and add them to your own themed frames like a personal gallery for beaches, mountains, or hidden gems.",
  },
];

export default function AppWalkthrough() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = walkthroughContent.length;

  const handleNext = () => {
  if (currentStep < totalSteps - 1) {
    setCurrentStep((prev) => prev + 1);
  } else {
    // restart carousel
    setCurrentStep(0);
  }
};


  const handleSkip = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const currentContent = walkthroughContent[currentStep] || walkthroughContent[0];


  return (
    <div className="relative w-full flex items-center justify-center ">
      {/* Main Onboarding Card */}
      <div className="relative w-full max-w-[30em] z-10">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#6CACDF] to-[#0000FE] min-h-[90vh] flex flex-col">
          {/* Image grid section - top part (2/3 of card) */}
          <div className=" flex-1 flex items-center justify-center">
            {currentContent.imageWidth && currentContent.imageHeight ? (
              <Image
                src={currentContent.image}
                alt="travel"
                width={currentContent.imageWidth}
                height={currentContent.imageHeight}
                className={currentContent.imageClassName}
                style={currentContent.imageStyle || {}}
              />
            ) : (
              <Image
                src={currentContent.image}
                alt="travel"
                fill
                className={currentContent.imageClassName}
                style={currentContent.imageStyle || {}}
              />
            )}
          </div>

          {/* Bottom info panel (1/3 of card) */}
          <div className="relative bg-gradient-to-b from-[#6CACDF]/98 via-[#4A8BC2]/98 to-[#0000FE]/98 rounded-t-3xl p-6 pb-8 flex-shrink-0">
            {/* Pagination dots and Skip button */}
            <div className="relative flex justify-center mb-4">
              <div className="flex gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${index === currentStep ? "bg-green-400" : "bg-white/60"
                      }`}
                  />
                ))}
              </div>
              {/* {currentStep < totalSteps - 1 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="absolute right-0 top-0 text-white text-sm font-medium hover:text-white/80 transition-colors"
                >
                  Skip
                </button>
              )} */}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white text-center mb-3 leading-tight whitespace-pre-line">
              {currentContent.title}
            </h1>

            {/* Description */}
            <p className="text-white/90 text-sm text-center mb-6 leading-relaxed px-2">
              {currentContent.description}
            </p>

            <div className="flex justify-center">
              {/* Next button */}
             <Button
  type="button"
  onClick={handleNext}
  className="w-[10em] rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-black hover:from-green-500 hover:via-green-600 hover:to-green-700 h-12 font-semibold shadow-lg"
>
  {currentStep < totalSteps - 1 ? "Next" : "Repeat"}
</Button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
