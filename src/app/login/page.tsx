import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Gem } from "lucide-react";
import { LogoMark } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  auth,
  isDevLoginEnabled,
  isGoogleConfigured,
  signIn,
} from "@/server/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/studio");

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-12 rounded-xl" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
            Sign in to blobgen
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect a channel and start generating on autopilot.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {isGoogleConfigured ? (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/studio" });
              }}
            >
              <button
                type="submit"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "h-11 w-full rounded-xl text-sm font-semibold",
                )}
              >
                Continue with Google
              </button>
            </form>
          ) : null}

          {isDevLoginEnabled ? (
            <form
              action={async () => {
                "use server";
                await signIn("dev", { redirectTo: "/studio" });
              }}
            >
              <button
                type="submit"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-11 w-full rounded-xl text-sm font-semibold glow-red",
                )}
              >
                <Gem className="size-4" />
                Continue as Dev (local)
              </button>
            </form>
          ) : null}

          {!isGoogleConfigured && !isDevLoginEnabled ? (
            <p className="rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
              No sign-in method configured. Set <code>AUTH_DEV_LOGIN=true</code>{" "}
              or Google OAuth keys in <code>.env.local</code>.
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Dev login needs no setup. Google OAuth also connects your YouTube
          channel.
        </p>
      </div>
    </main>
  );
}
