# Video Importer Agent Guide

## Context & stack

- **Location:** `apps/video-importer` in the Nx monorepo.
- **Purpose:** Bun-powered CLI for batch importing videos, subtitles, and audio previews into the Jesus Film Media platform.
- **Runtime:** Source runs with Bun for local importer execution and is compiled into standalone binaries for non-developer users.
- **External systems:** Cloudflare R2 uploads, GraphQL mutations/queries, Firebase auth, and `ffprobe` metadata extraction.

## Workspace setup

1. Install dependencies from the monorepo root with `pnpm install`.
2. Keep importer secrets in `apps/video-importer/.env`; never commit real credentials or copied secret values.
3. Ensure `ffprobe` is available before running real imports or metadata-dependent tests.
4. Fetch local secrets only when explicitly needed with `pnpm dlx nx run video-importer:fetch-secrets`.

## Core Nx targets

- `pnpm dlx nx run video-importer:run` - Run the importer against `apps/video-importer/test-videos`.
- `pnpm dlx nx run video-importer:test` - Run Node test runner specs through `tsx`.
- `pnpm dlx nx run video-importer:lint` - Lint the importer.
- `pnpm dlx nx run video-importer:type-check` - Type-check with `tsc -b`.
- `pnpm dlx nx run video-importer:build` - Compile TypeScript.
- `pnpm dlx nx run video-importer:compile` - Build the standalone Bun executable.
- `pnpm dlx nx run video-importer:package` - Build cross-platform release artifacts and copy the README.

## Import contracts

- Preserve the documented filename contracts in `README.md`.
- Video filenames must continue to parse as `<videoId>---<edition>---<languageId>---<version>[---extra].mp4`.
- Subtitle filenames must continue to parse as `<videoId>---<edition>---<languageId>[---extra].srt` or `.vtt`.
- Audio preview filenames must continue to parse as `<languageId>.aac`.
- Treat parsing changes as user-facing compatibility changes. Update importer regex tests and `README.md` together.
- Keep extensions lowercase unless intentionally broadening support and documenting it.

## Upload and mutation safety

- Use `--dry-run` for local discovery when uploads are not required.
- Do not run a real import unless credentials, target environment, and input folder are intentional.
- Validate video, edition, and language before creating R2 assets or uploading bytes.
- Keep failure paths explicit: log the failing stage, increment `summary.failed`, and return before later side effects.
- Mark a file as completed only after all required uploads and GraphQL updates have succeeded.
- Be careful when changing R2 object keys; downstream systems may depend on current path shapes.

## Packaging constraints

- The packaged binary is for non-developers. Keep console output direct, actionable, and free of developer-only jargon.
- Prefer dependencies and APIs that work in both Bun source execution and Bun standalone executable mode.
- Preserve default folder behavior: source execution defaults to `process.cwd()`, standalone executable mode defaults to the binary directory.
- If dynamic imports are used for packaging compatibility, verify the compiled executable path still works.

## Testing expectations

- Add or update co-located `*.spec.ts` tests for parsing, validation, retry/status behavior, and import branching touched by a change.
- Mock network, GraphQL, Firebase, R2, and filesystem side effects in unit tests.
- For importer orchestration changes, cover dry-run behavior and summary counts.
- For metadata changes, cover missing or incomplete `ffprobe` output.

## Quality gates

Run these before opening a PR when relevant to the change:

- `pnpm dlx nx run video-importer:test`
- `pnpm dlx nx run video-importer:type-check`
- `pnpm dlx nx run video-importer:lint`
- `pnpm dlx nx run video-importer:compile` for packaging-sensitive changes

If a check cannot be run because local dependencies, secrets, or tools are missing, note that explicitly in the handoff.

## Documentation

- Update `apps/video-importer/README.md` whenever CLI flags, filename rules, status-file behavior, setup requirements, or troubleshooting guidance changes.
- Keep README examples aligned with actual Commander options in `src/video-importer.ts`.
