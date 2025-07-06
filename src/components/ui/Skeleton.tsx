// src/components/ui/Skeleton.tsx
export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gray-300 rounded-xl"></div>
    </div>
  );
}

export function BoardSkeleton({ count = 16 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}