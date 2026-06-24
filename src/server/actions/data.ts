"use server";

import type { LibraryItem, Project as UiProject } from "@/lib/studio";
import { auth } from "@/server/auth";
import {
  getCreditBalance,
  listLibraryForChannel,
  listProjectsForChannel,
} from "@/server/projects/service";

export async function getCreditBalanceAction(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;
  return getCreditBalance(session.user.id);
}

export async function listProjectsAction(
  channelId: string,
): Promise<UiProject[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return listProjectsForChannel(channelId, session.user.id);
}

export async function listLibraryAction(
  channelId: string,
): Promise<LibraryItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return listLibraryForChannel(channelId, session.user.id);
}
