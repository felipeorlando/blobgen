function Block({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-muted/60 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
      <div className="mb-6 flex items-center gap-3.5">
        <Block className="size-14 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Block className="h-6 w-52" />
          <Block className="h-4 w-72 max-w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} className="h-28" />
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Block className="h-[420px] rounded-3xl" />
          <Block className="h-72 rounded-3xl" />
        </div>
        <div className="space-y-5">
          <Block className="h-80 rounded-3xl" />
          <Block className="h-48 rounded-3xl" />
          <Block className="h-56 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
