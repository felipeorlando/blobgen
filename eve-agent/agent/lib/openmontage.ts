/**
 * The OpenMontage boundary. Spawns the Python bridge (`run_tool.py`) to run a
 * tool through OpenMontage's registry and returns a typed ToolResult. This is
 * the ONLY place that knows OpenMontage exists — keep eve out of it so the
 * creative engine and the framework are independently swappable.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export class OpenMontageNotConfigured extends Error {
  constructor() {
    super(
      "OPENMONTAGE_DIR is not set — install OpenMontage (git clone + make setup) to use this capability.",
    );
    this.name = "OpenMontageNotConfigured";
  }
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | null;
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUN_TOOL = path.join(HERE, "run_tool.py");

export function isOpenMontageConfigured(): boolean {
  return Boolean(process.env.OPENMONTAGE_DIR);
}

function assertConfigured(): void {
  if (!isOpenMontageConfigured()) throw new OpenMontageNotConfigured();
}

function runPython(args: string[], timeoutMs = 600_000): Promise<ToolResult> {
  return new Promise((resolve) => {
    const py = process.env.PYTHON_BIN || "python3";
    const child = spawn(py, [RUN_TOOL, ...args], {
      env: process.env,
      cwd: process.env.OPENMONTAGE_DIR,
    });

    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({ success: false, error: `OpenMontage tool timed out after ${timeoutMs}ms` });
    }, timeoutMs);

    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ success: false, error: `spawn failed: ${e.message}` });
    });
    child.on("close", () => {
      clearTimeout(timer);
      const last = out.trim().split("\n").filter(Boolean).pop() ?? "";
      try {
        resolve(JSON.parse(last) as ToolResult);
      } catch {
        resolve({
          success: false,
          error: err.trim() || `unparseable bridge output: ${out.slice(0, 300)}`,
        });
      }
    });
  });
}

/** Provider/capability menu for the current environment (drives the cost estimate). */
export async function preflight(): Promise<ToolResult> {
  assertConfigured();
  return runPython(["--preflight"]);
}

/** Run a single OpenMontage tool by name with a params dict. */
export async function runTool(
  toolName: string,
  params: Record<string, unknown>,
): Promise<ToolResult> {
  assertConfigured();
  return runPython([toolName, JSON.stringify(params)]);
}
