---
date: 2026-05-06
topic: media-sync-endpoints
---

# Media Sync Endpoints

## Problem Frame

A remote data pipeline needs to incrementally sync media content from `api-media`. The existing `adminVideos` and `videoVariants` queries are sync-ready, but all child resource types lack the flat, paginated, filterable root queries required for efficient incremental pulls. Querying nested resources through parent types (e.g. pulling downloads through variants) is too slow at pipeline scale.

## Requirements

- R1. **VideoEdition sync query** — Upgrade the existing `videoEditions` root query to accept optional offset/limit pagination and `updatedAt: DateTimeFilter` args. When called without any args, behaviour must be identical to today (returns all editions). `updatedAt` is already exposed on the `VideoEdition` GraphQL type.

- R2. **VideoSubtitle sync query** — Expose `updatedAt` on the `VideoSubtitle` GraphQL type (field exists in DB, not currently in GraphQL). Add a new root-level `videoSubtitles` list query with optional offset/limit pagination and `updatedAt: DateTimeFilter` filtering.

- R3. **VideoOrigin sync query** — Expose `updatedAt` on the `VideoOrigin` GraphQL type (field exists in DB, not currently in GraphQL). Upgrade the existing `videoOrigins` root query to accept optional offset/limit pagination and `updatedAt: DateTimeFilter` args. When called without any args, behaviour must be identical to today.

- R4. **VideoVariantDownload sync query** — Add a DB migration to introduce `updatedAt @default(now()) @updatedAt` on the `VideoVariantDownload` Prisma model. Expose `updatedAt` on the `VideoVariantDownload` GraphQL type. Add a new root-level `videoVariantDownloads` list query with optional offset/limit pagination and `updatedAt: DateTimeFilter` filtering.

- R5. **VideoImages sync query** — Add a new root-level `videoImages` query that returns `CloudflareImage` records that are associated with videos (not user-scoped). Expose `updatedAt` on the `CloudflareImage` GraphQL type (field exists in DB, not currently in GraphQL). Support optional offset/limit pagination and `updatedAt: DateTimeFilter` filtering.

- R6. **Consistent pagination shape** — All new and upgraded queries must follow the same offset/limit convention used by `adminVideos` and `videoVariants`. A companion `<type>Count` query (e.g. `videoSubtitlesCount`, `videoVariantDownloadsCount`) must be added alongside each new list query to support total-count-based pagination. Upgraded existing queries (R1, R3) should also gain a companion count query if one does not already exist.

- R7. **All new and upgraded queries are public** — No authentication required. Consistent with the `videos` and `videoVariants` public queries.

## Success Criteria

- The data pipeline can sync each resource type independently without traversing nested parent types.
- All five resource types support filtering by `updatedAt` with `gte`/`lte` range args.
- All list queries support offset/limit pagination with a matching count query.
- Existing callers of `videoEditions` and `videoOrigins` are unaffected — adding no args produces the same result as today.

## Scope Boundaries

- `VideoImageAlt` (alt text translations) is out of scope — fits the existing localized content shape.
- `MuxVideo` is out of scope — user-upload management, not content library data.
- Cursor-based pagination is out of scope — offset/limit is sufficient for the batch pipeline use case.
- The `videoImages` query returns only images associated with videos; user-uploaded images not connected to a video are excluded.

## Key Decisions

- **Backwards-compatible upgrades for existing queries (R1, R3)**: Optional args only — no args means the same behaviour as today.
- **All new queries are public**: No auth required, consistent with `videos` and `videoVariants`.
- **`videoImages` is video-association-scoped**: Returns `CloudflareImage` records linked to videos, not filtered by `userId` like `getMyCloudflareImages`.
- **Add `updatedAt` to VideoVariantDownload via migration**: Incremental sync requires a timestamp — a migration is the right fix.
- **Flat root queries over nested traversal**: Each resource type gets its own independent paginated query rather than relying on parent-type resolution.

## Dependencies / Assumptions

- R4 requires a Prisma migration for `VideoVariantDownload.updatedAt` before the query can be implemented.
- R5 assumes the DB join between `CloudflareImage` and `Video` is queryable — the `Video.images` resolver already uses it; planning should confirm the foreign key or join table.
- All queries follow the `DateTimeFilter` / `toPrismaDateTimeFilter` pattern already established in `adminVideos` and `videoVariants`.

## Outstanding Questions

### Deferred to Planning

- [Affects R4][Technical] Confirm `VideoVariantDownload` migration strategy — column name, default value, and whether existing rows need backfilling or `@default(now())` is acceptable.
- [Affects R5][Needs research] Confirm the DB join between `CloudflareImage` and `Video` — verify the foreign key or join table used by the `Video.images` resolver so `videoImages` can replicate the same scope.
- [Affects R6][Technical] Confirm whether companion count queries need any filtering beyond `updatedAt` (e.g. should `videoSubtitlesCount` also accept a `languageId` filter for consistency with how subtitles are currently accessed?).

## Next Steps

→ `/ce:plan` for structured implementation planning
