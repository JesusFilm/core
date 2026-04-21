# Scripts

This directory contains standalone scripts that can be executed to perform various tasks.

## Data Import Script

The data import script allows you to import a database backup into the api-media database using psql.

### Usage

```bash
nx run api-media:data-import
```

### Environment Variables

The script requires the following environment variables:

- `PG_DATABASE_URL_MEDIA`: The connection string to the PostgreSQL database (required)
- `DB_SEED_PATH`: The path or URL to the SQL backup file's location (required)
  - Local file: Provide the directory path where the backup is located
  - Remote URL: Provide a base URL where the backup can be downloaded from

### Example

```bash
# Import from a remote URL
DB_SEED_PATH="https://example.com/backups" \
PG_DATABASE_URL_MEDIA="postgresql://postgres:postgres@localhost:5432/media" \
nx run api-media:data-import
```

### Process

The script will:

1. Check if the required environment variables are set
2. Look for or download a SQL backup file named `media-backup.sql.gz`
3. Decompress the file
4. Execute the SQL commands using `psql` with the following options:
   - Drops the existing public schema and recreates it
   - Uses single transaction mode for atomicity
   - Ensures errors stop the import process
5. Clean up temporary files

### Database Reset

The import process will completely reset your database by:

```sql
DROP SCHEMA public CASCADE; CREATE SCHEMA public;
```

This ensures a clean slate before importing the data and avoids conflicts with existing tables.

### Error Handling

The script includes error handling for various scenarios:

- Missing environment variables
- Failed download attempts
- File system operation failures
- Database connection issues

If any error occurs, the script will exit with a non-zero code and display an appropriate error message.

## Using Data Export Files

The data-export BullMQ job exports the api-media database in a format that can be directly imported with psql. The job runs automatically on a daily schedule and uploads the exports to Cloudflare R2 storage.

### Importing a Data Export

To import a data export file, use one of the following methods:

```bash
# If you have the compressed file locally
gunzip -c media-backup.sql.gz | psql -U postgres -d media

# Or if you downloaded from R2
gunzip -c media-backup.sql.gz | psql -U postgres -d media
```

### Export Format

The data export has the following characteristics:

1. Uses PLAIN SQL format with INSERT statements rather than COPY commands
2. Excludes non-essential tables like CloudflareImage, MuxVideo, CloudflareR2, and UserMediaRole
3. Removes schema ownership and privileges for compatibility

You can trigger a manual export using:

```bash
nx run api-media:data-export
```

## Update Arc.gt URLs Script

The update arc.gt URLs script updates VideoVariantDownload URLs from `https://arc.gt` to `https://api-v1.arclight.org` for specific distribution qualities.

### Usage

```bash
nx run api-media:update-arcgt-urls
```

### Process

The script will:

1. Find all VideoVariantDownloads with qualities: `distroLow`, `distroSd`, `distroHigh`
2. Filter for downloads with URLs starting with `https://arc.gt`
3. Update each URL by replacing `https://arc.gt` with `https://api-v1.arclight.org`
4. Process downloads in batches of 1000 for optimal performance
5. Preserve all URL paths and query parameters after the domain

### Target Qualities

The script only updates URLs for these specific qualities:

- `distroLow` - Distribution center low quality downloads
- `distroSd` - Distribution center SD quality downloads
- `distroHigh` - Distribution center high quality downloads

### URL Transformation

| Before                                          | After                                                        |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `https://arc.gt/video.mp4`                      | `https://api-v1.arclight.org/video.mp4`                      |
| `https://arc.gt/path/to/video.mp4?params=value` | `https://api-v1.arclight.org/path/to/video.mp4?params=value` |

### Error Handling

The script includes error handling for:

- Database connection issues
- Batch processing failures
- Progress tracking and reporting
- Individual update failures

If any error occurs, the script will exit with a non-zero code and display an appropriate error message.

## Mux Videos Script

The mux videos script processes video variants to create and manage Mux video assets, update HLS URLs, and process downloads. This script performs the same functions as the mux-videos worker but can be run on-demand.

### Usage

```bash
nx run api-media:mux-videos
```

### Environment Variables

The script requires the following environment variables:

- `MUX_ACCESS_TOKEN_ID`: Your Mux access token ID (required)
- `MUX_SECRET_KEY`: Your Mux secret key (required)

### Process

The script will:

1. **Import Mux Videos**: Create Mux assets for video variants that don't have them yet
   - Processes variants with masterHeight > 720p or originId != '1'
   - Creates Mux assets with appropriate resolution tiers (1080p, 1440p, 2160p)
   - Links the created assets to video variants

2. **Update HLS URLs**: Update streaming URLs for variants with Mux videos
   - Finds variants with Mux videos but non-Mux HLS URLs
   - Updates HLS URLs to use Mux streaming endpoints
   - Updates playback IDs in the database

3. **Process Downloads**: Create or update downloads for variants with Mux videos
   - Processes variants that either have no downloads or have non-Mux downloads
   - Excludes distro downloads (distroLow, distroSd, distroHigh) from replacement
   - Creates new Mux-based downloads when static renditions are ready

### Rate Limiting

The script includes rate limiting with 1.5-second delays between API requests to avoid hitting Mux API limits.

### Error Handling

The script includes comprehensive error handling for:

- Missing environment variables
- Mux API failures
- Database operation failures
- Network connectivity issues

If any error occurs, the script will log the error and continue processing other items when possible.

## Migrate Hindu/Buddhist Tags (two scripts)

A one-off data migration (NES-1591) that splits the legacy combined `Hindu/Buddist` Audience tag into two separate tags — `Hindu` and `Buddhist` — and re-tags every template that used the combined tag with **both** new tags.

The migration requires **two** scripts, run in order against each environment (stage first, then prod):

1. **Script 1 — media side:** `nx run api-media:migrate-hindu-buddhist-tags`
   Renames the legacy `Hindu/Buddist` `Tag` row to `Hindu` (preserving its `Tag.id`) and upserts a new `Buddhist` `Tag` under the `Audience` parent. Updates the primary English `TagName`s. Media DB only.

2. **Script 2 — journeys side:** `nx run api-journeys-modern:extend-hindu-buddhist-templates --apply`
   For every journey currently linked to Hindu via `JourneyTag`, creates a matching `JourneyTag` pointing at Buddhist. Reads tag IDs from media by name; writes to the journeys DB. Dry-run by default — pass `--apply` to commit.

Script 1 must run before Script 2 in each environment. Both are idempotent.

### Why two scripts?

Template → tag relationships live in the **journeys** DB (`JourneyTag`), not the media DB. `JourneyTag.tagId` carries a bare cross-DB reference to `media.Tag.id` with no FK enforcement. Renaming the legacy media row preserves that id, so existing `JourneyTag` rows automatically resolve to "Hindu" the moment Script 1 commits. Script 2 is purely additive on the journeys side — it only inserts new `JourneyTag` rows for the Buddhist tag. The dormant `media.Tagging` table is explicitly **not** involved; no application code writes to it.

### Environment Variables

- Script 1 requires `PG_DATABASE_URL_MEDIA`.
- Script 2 requires both `PG_DATABASE_URL_MEDIA` (for the Tag lookup) and `PG_DATABASE_URL_JOURNEYS` (for the `JourneyTag` writes).

### Script 1 — Process

All steps run inside a single Prisma `$transaction` against the media client. On any failure, the transaction rolls back and the media DB is left in its pre-run state.

1. Look up the legacy `Hindu/Buddist` tag. If absent, exit immediately (idempotent — already migrated).
2. Look up the `Audience` parent tag. If absent, throw — the DB is not a validly-seeded media database.
3. **Collision guard:** look up `Hindu` by name. If a row already exists with a different id than the legacy tag, delete its `TagName` rows and the `Tag` row. This only happens in local dev (a developer ran the updated seed before the migration); stage and prod never have a standalone `Hindu` row before this runs.
4. Rename the legacy row: `tag.update({ data: { name: 'Hindu' } })`. `Tag.id` is preserved, so every existing `JourneyTag` pointing at this row now resolves to `Hindu`.
5. Update the primary English `TagName.value` from `'Hindu/Buddist'` to `'Hindu'`. Filter on `languageId: '529'` (not on the current value) so we always target the primary English row.
6. Upsert a new `Buddhist` tag under `Audience` and its primary English `TagName` at `languageId '529'`.

Non-English localized `TagName` rows attached to the legacy tag remain attached to the renamed tag after Script 1 — they keep their existing localized values. English-only updates are the scope of this migration. Use the inspection query below to see what exists before running.

### Script 2 — Process

Dry-run by default. Pass `--apply` to commit. Reads the media DB by tag name; writes to the journeys DB only.

1. Read the `Hindu` and `Buddhist` tag IDs from media. If either is missing, throw — Script 1 must be run first.
2. Find every `JourneyTag` row whose `tagId` matches the Hindu tag. The distinct `journeyId`s are the templates that need Buddhist added.
3. In dry-run mode, log what would be inserted and exit.
4. With `--apply`, inside a journeys-DB `$transaction`, `createMany` new `JourneyTag` rows with `{ journeyId, tagId: buddhistId }` for each affected journey. The `@@unique([journeyId, tagId])` constraint + `skipDuplicates: true` make this idempotent.

### Idempotency

Both scripts are safe to re-run.

- Script 1: after the first successful run the legacy `Hindu/Buddist` tag is gone, so the early-exit check returns immediately on every subsequent run.
- Script 2: `createMany({ skipDuplicates: true })` honoring `@@unique([journeyId, tagId])` means repeated runs add only rows that don't already exist. A second `--apply` run against a fully-migrated DB is a no-op.

### Error Handling

Each script wraps its mutations in its own Prisma transaction (per single client; cross-DB transactions are not possible). On any unhandled error, the transaction rolls back and the script exits with a non-zero code. If Script 1 succeeds but Script 2 fails, re-run Script 2 — it picks up where it left off. Between Script 1's commit and Script 2's completion, affected templates appear tagged with `Hindu` only; run both scripts back-to-back to minimize this window.

### Pre-run inspection (optional)

Before running, check for localized `TagName` rows attached to the legacy tag. English is `languageId: '529'`.

```sql
SELECT tn.id, tn.value, tn."languageId", tn."primary"
FROM "TagName" tn
JOIN "Tag" t ON t.id = tn."tagId"
WHERE t.name = 'Hindu/Buddist'
ORDER BY tn."primary" DESC, tn."languageId";
```

If only the English primary row exists, the English-only scope is trivially safe. If non-English rows exist, they'll remain attached to the renamed `Hindu` tag after Script 1 with their existing localized values — translation teams can re-translate as a follow-up.

### Rollout Procedure

Run the migration against **stage first**. Do not run against production until stage has been validated end-to-end.

#### 1. Stage — Script 1 (media rename + Buddhist upsert)

```bash
PG_DATABASE_URL_MEDIA="<stage media connection string>" nx run api-media:migrate-hindu-buddhist-tags
```

#### 2. Stage — Script 2 dry-run

```bash
PG_DATABASE_URL_MEDIA="<stage media>" \
  PG_DATABASE_URL_JOURNEYS="<stage journeys>" \
  nx run api-journeys-modern:extend-hindu-buddhist-templates
```

Inspect the output — it lists every `journeyId` that would be extended with a Buddhist `JourneyTag`. Cross-check the count against the expected number of templates (4 in current production data).

#### 3. Stage — Script 2 apply

```bash
PG_DATABASE_URL_MEDIA="<stage media>" \
  PG_DATABASE_URL_JOURNEYS="<stage journeys>" \
  nx run api-journeys-modern:extend-hindu-buddhist-templates --apply
```

#### 4. Stage verification

**UI:** Log in to the stage admin, open a template's Audience checkbox list, and confirm:

- `Hindu/Buddist` is no longer listed.
- `Hindu` and `Buddhist` are listed as separate options.
- Every template that previously carried the combined tag now shows **both** `Hindu` and `Buddhist` ticked.

**SQL — media DB** (replace `<hinduId>` and `<buddhistId>` with the UUIDs reported by Script 1's final log line):

```sql
-- Must return 0 rows.
SELECT * FROM "Tag" WHERE name = 'Hindu/Buddist';

-- Must return 2 rows, both with parentId equal to the Audience tag's id.
SELECT t.id, t.name, t."parentId"
FROM "Tag" t
WHERE t.name IN ('Hindu', 'Buddhist');
```

**SQL — journeys DB:**

```sql
-- Count of JourneyTag rows pointing at Hindu. Expected: equal to the number of templates that had the legacy tag (4 in prod).
SELECT COUNT(*) FROM "JourneyTag" WHERE "tagId" = '<hinduId>';

-- Count pointing at Buddhist. Expected: equal to the Hindu count after Script 2 --apply.
SELECT COUNT(*) FROM "JourneyTag" WHERE "tagId" = '<buddhistId>';

-- Every affected journey must carry BOTH tags.
-- Expected: COUNT rows back = number of affected journeys.
SELECT "journeyId"
FROM "JourneyTag"
WHERE "tagId" IN ('<hinduId>', '<buddhistId>')
GROUP BY "journeyId"
HAVING COUNT(*) = 2;
```

#### 5. Production — repeat steps 1-4

Only after every stage check passes. Swap the stage connection strings for production strings and repeat the same commands + verifications.
