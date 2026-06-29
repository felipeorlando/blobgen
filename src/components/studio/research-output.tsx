interface ResearchBriefData {
  summary?: string;
  keyPoints?: string[];
  angles?: string[];
  audienceNotes?: string;
  competitorGaps?: string[];
  sources?: { title?: string; url?: string }[];
  suggestedTitles?: string[];
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
        {label}
      </p>
      <div className="mt-1.5 text-sm text-foreground/90">{children}</div>
    </div>
  );
}

export function ResearchOutput({ data }: { data: unknown }) {
  const brief = (data ?? {}) as ResearchBriefData;
  return (
    <div className="space-y-4">
      {brief.summary ? (
        <p className="text-sm leading-relaxed text-foreground/90">
          {brief.summary}
        </p>
      ) : null}

      {brief.keyPoints?.length ? (
        <Section label="Key points">
          <ul className="list-disc space-y-1 pl-4">
            {brief.keyPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {brief.suggestedTitles?.length ? (
        <Section label="Suggested titles">
          <div className="flex flex-wrap gap-1.5">
            {brief.suggestedTitles.map((t, i) => (
              <span
                key={i}
                className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>
      ) : null}

      {brief.sources?.length ? (
        <Section label="Sources">
          <ul className="space-y-1">
            {brief.sources.slice(0, 8).map((s, i) => (
              <li key={i} className="truncate text-xs">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}
