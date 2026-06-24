interface CutsData {
  url?: string;
  durationSec?: number;
  width?: number;
  height?: number;
  hasAudio?: boolean;
}

export function CutsOutput({ data }: { data: unknown }) {
  const cut = (data ?? {}) as CutsData;
  if (!cut.url) {
    return <p className="text-sm text-muted-foreground">No video produced.</p>;
  }
  return (
    <div className="space-y-2">
      <video
        src={cut.url}
        controls
        playsInline
        className="mx-auto aspect-[9/16] max-h-[28rem] rounded-lg border border-border bg-black"
      />
      <p className="text-center text-xs text-muted-foreground">
        {cut.width}×{cut.height} · ~{cut.durationSec}s
        {cut.hasAudio ? " · with voiceover" : " · silent (mock voiceover)"}
      </p>
    </div>
  );
}
