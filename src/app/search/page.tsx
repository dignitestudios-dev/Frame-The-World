import { Suspense } from "react";
import SearchClientContent from "./SearchClientContent";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <SearchClientContent />
    </Suspense>
  );
}
