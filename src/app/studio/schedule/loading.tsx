function Block({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-5 py-8 sm:px-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} className="h-[104px] rounded-lg" />
        ))}
      </div>
      <Block className="h-[320px] rounded-lg" />
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12">
        <Block className="h-64 rounded-lg xl:col-span-7" />
        <Block className="h-64 rounded-lg xl:col-span-5" />
      </div>
    </div>
  );
}
