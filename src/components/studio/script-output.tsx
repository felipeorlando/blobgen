interface ScriptData {
  title?: string;
  hook?: string;
  sections?: { heading?: string; beats?: string[]; timecode?: string }[];
  cta?: string;
  estimatedDurationSec?: number;
  wordCount?: number;
}

export function ScriptOutput({ data }: { data: unknown }) {
  const script = (data ?? {}) as ScriptData;
  return (
    <div className="space-y-3 font-mono text-[0.8rem] leading-relaxed">
      {script.hook ? (
        <div>
          <p className="font-semibold tracking-wide text-primary/90">HOOK</p>
          <p className="text-foreground/85">{script.hook}</p>
        </div>
      ) : null}

      {script.sections?.map((s, i) => (
        <div key={i}>
          <p className="font-semibold tracking-wide text-primary/90">
            {s.heading}
            {s.timecode ? (
              <span className="ml-2 font-normal text-muted-foreground">
                {s.timecode}
              </span>
            ) : null}
          </p>
          {s.beats?.map((b, j) => (
            <p key={j} className="text-foreground/85">
              {b}
            </p>
          ))}
        </div>
      ))}

      {script.cta ? (
        <div>
          <p className="font-semibold tracking-wide text-primary/90">CTA</p>
          <p className="text-foreground/85">{script.cta}</p>
        </div>
      ) : null}

      {script.estimatedDurationSec || script.wordCount ? (
        <p className="pt-1 font-sans text-[0.7rem] text-muted-foreground">
          ~{script.estimatedDurationSec ?? 0}s · {script.wordCount ?? 0} words
        </p>
      ) : null}
    </div>
  );
}
