import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-shimmer rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export function SkeletonCircle({ className, size = "h-10 w-10", ...props }: SkeletonProps & { size?: string }) {
  return (
    <Skeleton
      className={cn("rounded-full", size, className)}
      {...props}
    />
  );
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-4 w-full rounded-full", className)}
      {...props}
    />
  );
}
