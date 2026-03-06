"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const backgroundImages = [
  { image: "/images/1.jpg", name: "Image 1" },
  { image: "/images/2.jpg", name: "Image 2" },
  { image: "/images/3.jpg", name: "Image 3" },
  { image: "/images/4.jpg", name: "Image 4" },
];

// Duplicate images to create seamless scrolling
const allImages = [...backgroundImages, ...backgroundImages, ...backgroundImages];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Background Image Grid */}
      <div className="absolute inset-0 z-0 grid grid-cols-6 gap-3">
        {/* Column 1 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={allImages}
            direction="bottom"
            speed="slow"
            pauseOnHover={false}
            orientation="vertical"
            className="h-full w-full"
          />
        </div>
        {/* Column 2 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={[...allImages.slice(1), ...allImages.slice(0, 1)]}
            direction="top"
            speed="slow"
            pauseOnHover={false}
            orientation="vertical"
            className="h-full w-full"
          />
        </div>
        {/* Column 3 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={[...allImages.slice(2), ...allImages.slice(0, 2)]}
            direction="bottom"
            speed="slow"
            pauseOnHover={false}
            orientation="vertical"
            className="h-full w-full"
          />
        </div>
        {/* Column 4 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={allImages}
            direction="top"
            speed="slow"
            pauseOnHover={false}
            orientation="vertical"
            className="h-full w-full"
          />
        </div>
        {/* Column 5 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={[...allImages.slice(1), ...allImages.slice(0, 1)]}
            direction="bottom"
            speed="slow"
            pauseOnHover={false}
            orientation="vertical"
            className="h-full w-full"
          />
        </div>
        {/* Column 6 */}
        <div className="h-full w-full">
          <InfiniteMovingCards
            items={[...allImages.slice(2), ...allImages.slice(0, 2)]}
            direction="top"
            speed="slow"
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
