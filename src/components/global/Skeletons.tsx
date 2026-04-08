import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/Skeleton";

export function ProfileSidebarSkeleton() {
  return (
    <aside className="relative bg-[#f1f3f6] rounded-[30px] p-8 shadow-sm h-fit">
      <div className="flex flex-col items-center">
        {/* Avatar Squircle Skeleton */}
        <Skeleton className="w-36 h-36 rounded-[55px] mb-6" />
        
        {/* Name Skeleton */}
        <SkeletonText className="w-32 h-6 mb-4" />
        
        {/* Bio Skeleton */}
        <div className="w-full space-y-2 mb-4 px-6">
          <SkeletonText />
          <SkeletonText className="w-4/5 mx-auto" />
        </div>

        {/* Company Info */}
        <div className="text-center w-full space-y-2 mb-8">
          <SkeletonText className="w-24 h-4 mx-auto" />
          <SkeletonText className="w-32 h-3 mx-auto" />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-2 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-6 w-10" />
              <SkeletonText className="w-12 h-2" />
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        <div className="w-full mt-10">
          <SkeletonText className="w-32 h-6 mb-6" />
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <SkeletonCircle size="h-12 w-12" />
                <SkeletonText className="w-8 h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function GridCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gray-100 shadow-xl h-full w-full">
      <Skeleton className="absolute inset-0" />
    </div>
  );
}

export function CategoryChipSkeleton() {
  return (
    <Skeleton className="px-5 py-2.5 rounded-full h-10 w-24" />
  );
}

export function FrameCardSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <Skeleton className="rounded-[49px] w-[200px] h-[200px]" />
      <SkeletonText className="mt-4 w-24 h-4" />
    </div>
  );
}
