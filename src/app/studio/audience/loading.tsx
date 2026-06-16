function Block({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/60 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
      <div className="mb-7 flex items-center gap-3.5">
        <Block className="size-14 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <Block className="h-6 w-52" />
          <Block className="h-4 w-64 max-w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} className="h-28" />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Block className="h-64 lg:col-span-2" />
        <Block className="h-64" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Block key={i} className="h-56" />
        ))}
      </div>
    </div>
  );
}
