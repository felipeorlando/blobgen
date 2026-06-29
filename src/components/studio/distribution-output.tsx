import { CalendarClock, ExternalLink } from "lucide-react";

interface DistData {
  videoId?: string;
  url?: string;
  publishAt?: string;
  status?: string;
  privacyStatus?: string;
  mock?: boolean;
}

export function DistributionOutput({ output }: { output: unknown }) {
  const d = (output ?? {}) as DistData;
  if (!d.videoId) {
    return <p className="text-sm text-muted-foreground">Not published yet.</p>;
  }
  const when = d.publishAt
    ? new Date(d.publishAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="space-y-2 text-sm">
      <p className="flex flex-wrap items-center gap-x-2 text-foreground/90">
        <CalendarClock className="size-4 text-primary" />
        <span className="font-medium">
          {d.status === "scheduled" ? "Scheduled" : "Published"}
        </span>
        {when ? <span className="text-muted-foreground">· {when}</span> : null}
        {d.privacyStatus ? (
          <span className="text-muted-foreground">· {d.privacyStatus}</span>
        ) : null}
      </p>

      {d.mock ? (
        <p className="rounded-md border border-dashed border-border bg-muted/40 p-2 text-xs text-muted-foreground">
          Mock publish — sign in with Google (a channel connected to YouTube) for
          a real upload.
        </p>
      ) : (
        <a
          href={d.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          View on YouTube <ExternalLink className="size-3.5" />
        </a>
      )}
    </div>
  );
}
