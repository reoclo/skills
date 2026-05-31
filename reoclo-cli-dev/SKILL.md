---
name: reoclo-cli-dev
description: Use when developing, building, testing, or debugging the reoclo CLI (reoclo-cli) codebase in cli/ — the Bun toolchain, running tests, cross-compiling standalone binaries, adding a command, or diagnosing runtime quirks of Bun `--compile` binaries (e.g. errors that spawn "bun", a broken `rc` alias, or path-separator test failures).
---

# reoclo-cli-dev: Develop the reoclo CLI

## Overview

`cli/` is a **Bun-native TypeScript** CLI (`commander`) shipped as standalone binaries via `bun build --compile`. End users need neither Bun nor Node; **building from source needs Bun 1.3.x**.

## Toolchain (run from `cli/`)

| Task | Command |
|------|---------|
| Run from source | `bun run dev` (= `bun run src/index.ts`) |
| Unit tests | `bun test tests/unit/` |
| Typecheck | `bun run typecheck` (`tsc --noEmit`) |
| Build 6 binaries | `bun run build` (`scripts/build-all.ts` → `dist/reoclo-<platform>`) |
| Lint / format | `bun run lint` / `bun run format` |

Entry point `src/index.ts` (`#!/usr/bin/env bun`, guarded by `if (import.meta.main)`). Each subcommand is `src/commands/<name>.ts` exporting `register<Name>(program)`, wired up in `index.ts`.

## Versioning

`package.json` `version` is the **single source of truth** (`index.ts` reads `pkg.version`). Bump it in every `feat`/`fix` commit that touches CLI code: fix→patch, feat→minor.

## Testing conventions

- Tests live in `tests/unit/` **mirroring `src/`** (e.g. `src/lib/x.ts` → `tests/unit/lib/x.test.ts`). Use `bun:test`.
- **CI runs each file in its own process:** `for f in $(find tests/unit -name "*.test.ts"); do bun test "$f"; done`. This isolates `mock.module()` (process-global) and per-test `REOCLO_CACHE_DIR` env toggles that otherwise leak across files on Linux.
- **Co-located `src/**/*.test.ts` are NOT run by CI** (it globs `tests/unit/` only). A test only gates releases if it lives in `tests/unit/`.
- Make logic testable by extracting pure helpers that **inject** their inputs (default to the `process` value, accept an override param) — e.g. `reinvokeArgv(argv, execPath = process.execPath)`, `detectProgramName(argv0 = process.argv0)`.

## Bun `--compile` binary gotchas (all verified on this CLI)

A compiled binary embeds the Bun runtime, so `process` does NOT behave like Node:

| Field | In a compiled binary | Use it for |
|-------|----------------------|-----------|
| `process.argv[0]` | literal string `"bun"` (NOT a path) | ❌ never spawn or name-detect from this |
| `process.execPath` | real path of the running binary (resolves symlinks) | ✅ re-spawning the CLI itself |
| `process.argv0` | original OS argv[0] — preserves the invocation (`rc`, `./rc`, `/usr/local/bin/rc`) | ✅ program-name / `rc`-alias detection |
| `process.argv[1]` / `Bun.main` | `/$bunfs/root/<outfile>` embedded path | ❌ not the real on-disk path or invocation |

More:
- **`spawn()` ENOENT is an async `'error'` event, not a sync throw.** A `try/catch` around `spawn()` won't catch a missing executable — attach `child.on("error", () => {})` to swallow it.
- **`node:path.basename` is POSIX in the test runner** (macOS/Linux) and does NOT split on `\`. Don't assert Windows drive paths (`C:\bin\rc.exe`) in tests; use bare names (`RC.exe`). On real Windows `basename` is win32 and splits correctly.
- **Probe before fixing argv behavior.** Compile a tiny script and run it (and via a symlink) to see ground truth — don't assume:
  ```bash
  printf 'console.log(JSON.stringify({a0:process.argv0,a:process.argv[0],e:process.execPath}))' > /tmp/p.ts
  bun build --compile --target=bun-darwin-arm64 /tmp/p.ts --outfile /tmp/p && ln -sf p /tmp/rc
  /tmp/p x; /tmp/rc x
  ```

## Adding a command

1. `src/commands/<name>.ts` exporting `register<Name>(program)`.
2. Wire `register<Name>(program)` into `src/index.ts`.
3. Auth/gating: if it runs before login or needs no auth, add it to `PASSTHROUGH_COMMANDS` in `index.ts`; capability gating lives in `src/client/command-meta.ts`; org-vs-automation routing in `src/client/routing.ts`.
4. Completion: register in `src/completion/`.
5. Tests in `tests/unit/commands/<name>.test.ts`.

## Install paths (no Bun required for users)

`packaging/install.sh` (curl|bash), `packaging/homebrew/` (tap), `packaging/npm-shim/` (Node launcher that execs the prebuilt binary). All run the compiled binary; none need Bun at runtime.
