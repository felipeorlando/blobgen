export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}
