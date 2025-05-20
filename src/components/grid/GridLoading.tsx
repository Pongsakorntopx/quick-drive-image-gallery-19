
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface GridLoadingProps {
  count?: number;
}

const GridLoading: React.FC<GridLoadingProps> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg overflow-hidden shadow-sm group hover:shadow-md transition-shadow duration-200">
          <Skeleton className="aspect-[3/2] w-full" />
          <div className="p-2">
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridLoading;
