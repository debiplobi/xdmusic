import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const MediaSkeletonGrid = ({ count = 6, height = 300 }: { count?: number; height?: number }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, index) => (
            <Skeleton key={index} className="w-full rounded-lg" style={{ height: `${height}px` }} />
        ))}
    </div>
);

export const SongSkeletonList = ({ count = 5 }: { count?: number }) => (
    <div className="grid gap-4">
        {Array.from({ length: count }).map((_, index) => (
            <div
                key={index}
                className="flex items-center p-0 cursor-pointer hover:bg-accent transition-colors duration-200"
            >
                <Skeleton className="w-20 h-20 rounded-l-lg flex-shrink-0" />
                <div className="p-4 flex-grow space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

export const PageHeaderSkeleton = () => (
    <div className="mb-10">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-10 w-10 mb-4" />
    </div>
);
