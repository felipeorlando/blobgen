function Block({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <Block className="h-9 w-80 max-w-[60%]" />
        <Block className="h-9 w-72 max-w-[35%]" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Block key={i} className="h-52 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
