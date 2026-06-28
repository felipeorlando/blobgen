#!/usr/bin/env python3
"""Bridge: invoke an OpenMontage tool from the eve agent and emit JSON.

Usage:
    python run_tool.py --preflight
    python run_tool.py <ToolName> '<json_params>'

Reads OPENMONTAGE_DIR from the environment, makes its tools importable, runs the
named tool through the registry, and prints exactly one JSON line:
    {"success": bool, "data": <any>, "error": <str|null>}

The agent (agent/lib/openmontage.ts) spawns this and parses the last stdout line.
"""
import json
import os
import sys


def emit(obj):
    print(json.dumps(obj, default=str))


def main():
    om = os.environ.get("OPENMONTAGE_DIR")
    if not om:
        emit({"success": False, "error": "OPENMONTAGE_DIR not set"})
        return
    sys.path.insert(0, om)

    try:
        from tools.tool_registry import registry  # type: ignore
    except Exception as e:  # pragma: no cover - env dependent
        emit({"success": False, "error": f"could not import OpenMontage registry: {e}"})
        return

    try:
        registry.discover()
    except Exception as e:  # pragma: no cover
        emit({"success": False, "error": f"registry.discover() failed: {e}"})
        return

    # Preflight: report the provider/capability menu for the current environment.
    if len(sys.argv) >= 2 and sys.argv[1] == "--preflight":
        try:
            emit({"success": True, "data": registry.provider_menu_summary()})
        except Exception as e:
            emit({"success": False, "error": str(e)})
        return

    tool = sys.argv[1] if len(sys.argv) >= 2 else ""
    params = json.loads(sys.argv[2]) if len(sys.argv) >= 3 else {}

    try:
        # OpenMontage exposes `.execute(params_dict)`. Support both the registry
        # facade (registry.execute(name, params)) and the per-tool form
        # (registry.get(name).execute(params)) since the API varies by build.
        result = None
        if hasattr(registry, "execute"):
            try:
                result = registry.execute(tool, params)
            except TypeError:
                result = None
        if result is None and hasattr(registry, "get"):
            result = registry.get(tool).execute(params)

        emit(
            {
                "success": bool(getattr(result, "success", result is not None)),
                "data": getattr(result, "data", result),
                "error": getattr(result, "error", None),
            }
        )
    except Exception as e:
        emit({"success": False, "error": str(e)})


if __name__ == "__main__":
    main()
