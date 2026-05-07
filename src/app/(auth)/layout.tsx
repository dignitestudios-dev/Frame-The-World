"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const firstColumnImages = [
  { image: "/images/1.jpg", name: "Image 1" },
  { image: "/images/2.jpg", name: "Image 2" },
  { image: "/images/3.jpg", name: "Image 3" },
  { image: "/images/4.jpg", name: "Image 4" },
];

const secondColumnImages = [
  { image: "/images/5.jpg", name: "Image 5" },
  { image: "/images/6.jpg", name: "Image 6" },
  { image: "/images/7.jpg", name: "Image 7" },
  { image: "/images/8.jpg", name: "Image 8" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Background Image Grid */}
      <div className="absolute inset-0 z-0 grid grid-cols-5 gap-2">
        {/* Column 1 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={firstColumnImages}
            direction="bottom"
            speed="super-slow"
            pauseOnHover={false}
            orientation="vertical"
            className="h-full w-full"
          />
        </div>
        {/* Column 2 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={secondColumnImages}
            direction="top"
            speed="super-slow"
            pauseOnHover={false}
            orientation="vertical"
            className="h-full w-full"
          />
        </div>
        {/* Column 3 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={firstColumnImages}
            direction="bottom"
            speed="super-slow"
            pauseOnHover={false}
            orientation="vertical"
            className="h-full w-full"
          />
        </div>
        {/* Column 4 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={secondColumnImages}
            direction="top"
            speed="super-slow"
            pauseOnHover={false}
            orientation="vertical"
            className="h-full w-full"
          />
        </div>
        {/* Column 5 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={firstColumnImages}
            direction="bottom"
            speed="super-slow"
            pauseOnHover={false}
            orientation="vertical"
            className="h-full w-full"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-end p-4 pr-8 md:pr-16">
        {children}
      </div>
    </div>
  );
}
