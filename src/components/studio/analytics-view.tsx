"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Calendar, ChevronDown } from "lucide-react";
import { YouTubeIcon } from "@/components/icons";
import {
  compact,
  getAnalytics,
  getKpis,
  getVideos,
  signed,
} from "@/lib/studio";
import { StudioTopbar } from "./studio-topbar";
import { KpiCard } from "./kpi-card";
import { RetentionChart } from "./retention-chart";
import { AnalyticsScope } from "./analytics-scope";
import { AiInsights } from "./ai-insights";
import { FormatSplit } from "./format-split";
import { UploadHeatmap } from "./upload-heatmap";
import { useStudio } from "./studio-context";

export function AnalyticsView() {
  const { channel, channelId } = useStudio();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // A new channel starts on its aggregate view.
  useEffect(() => setSelectedId(null), [channelId]);

  const videos = getVideos(channelId);
  const analytics = getAnalytics(channelId);
  const selected = videos.find((v) => v.id === selectedId) ?? null;
  const kpis = getKpis(channelId, selected);

  return (
    <>
      <StudioTopbar title="Performance" subtitle={channel.handle}>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
        >
          <Calendar className="size-4 text-muted-foreground" />
          Last 28 days
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 active:translate-y-px"
        >
          <YouTubeIcon className="size-4" />
          <span className="hidden sm:inline">Connect YouTube Studio</span>
          <span className="sm:hidden">Connect</span>
        </button>
      </StudioTopbar>

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
        {/* Channel identity + scope selector */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <Image
              src={channel.image}
              alt=""
              width={56}
              height={56}
              className="size-12 rounded-lg object-cover ring-1 ring-inset ring-black/10 sm:size-14 dark:ring-white/10"
            />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                {channel.name}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {channel.handle} · {compact(channel.subscribers)} subscribers ·{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {signed(analytics.subsGained, "")} this month
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              Showing
            </span>
            <AnalyticsScope
              channel={channel}
              videos={videos}
              selectedId={selectedId}
              onSelect={setSelectedId}
              channelRetention={analytics.retention}
            />
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.key} kpi={kpi} index={i} />
          ))}
        </div>

        {/* Retention + insights */}
        <div className="mt-5 grid items-start gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RetentionChart
              curve={selected ? selected.curve : analytics.curve}
              average={selected ? selected.retention : analytics.retention}
              title={
                selected
                  ? selected.title
                  : `Channel average across ${videos.length} uploads`
              }
            />
          </div>
          <AiInsights analytics={analytics} />
        </div>

        {/* Format mix + cadence */}
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
          <FormatSplit
            shorts={analytics.formatSplit.shorts}
            long={analytics.formatSplit.long}
          />
          <div className="lg:col-span-2">
            <UploadHeatmap data={analytics.heatmap} />
          </div>
        </div>
      </div>
    </>
  );
}
