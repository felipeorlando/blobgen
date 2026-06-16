function Block({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-muted/60 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-16 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
        <Block className="h-7 w-44 rounded-full" />
        <Block className="h-12 w-80 max-w-full" />
        <Block className="h-5 w-96 max-w-full" />
      </div>
      <div className="mx-auto mt-9 max-w-3xl">
        <Block className="h-64 w-full rounded-3xl" />
      </div>
      <div className="mx-auto mt-14 grid max-w-[1180px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} className="h-52" />
        ))}
      </div>
    </div>
  );
}
