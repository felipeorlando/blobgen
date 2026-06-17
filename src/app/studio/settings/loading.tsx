import { Block } from "@/components/studio/loading-blocks";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex gap-2 lg:w-56 lg:shrink-0 lg:flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <Block key={i} className="h-9 flex-1 lg:w-full" />
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Block key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
