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

## Migrate Hindu/Buddhist Tags Script

A one-off data migration that splits the legacy combined `Hindu/Buddist` Audience tag into two separate tags — `Hindu` and `Buddhist` — deletes the legacy tag entirely, and re-tags every template that used it so each template ends up tagged with **both** new tags.

### Usage

```bash
nx run api-media:migrate-hindu-buddhist-tags
```

### Environment Variables

- `PG_DATABASE_URL_MEDIA`: connection string to the media PostgreSQL database (required).

### Process

All steps run inside a single Prisma transaction. On any failure, the transaction rolls back and the database is left in its pre-run state.

1. Look up the legacy `Hindu/Buddist` tag. If absent, exit immediately (idempotent — already migrated).
2. Look up the `Audience` parent tag. If absent, throw — the database is not a validly-seeded media database.
3. Snapshot every `Tagging` that points at the legacy tag into memory. (The snapshot is used in step 6 before the legacy tag is deleted; otherwise those `Tagging` rows cascade-delete.)
4. Upsert a `Hindu` tag under `Audience` with a primary English `TagName` (languageId `'529'`). Upsert is idempotent — if a `Hindu` row already exists (e.g., from a fresh seed run in a dev environment), it is reused.
5. Upsert a `Buddhist` tag under `Audience` with a primary English `TagName`, the same way.
6. For every snapshotted `Tagging`, create two new `Tagging` rows — one on `Hindu`, one on `Buddhist` — preserving `taggableId`, `taggableType`, and `context`. `skipDuplicates: true` keeps partial-rerun scenarios safe.
7. Delete the legacy tag's `TagName` rows. (`TagName.tagId` is `ON DELETE RESTRICT`, so these must be removed before the parent `Tag`.)
8. Delete the legacy `Tag` row. (`Tagging.tag` is `ON DELETE CASCADE`, so any remaining legacy taggings are removed automatically.)

### Idempotency

Safe to re-run. After the first successful run the legacy tag is gone, so step 1 exits immediately on every subsequent invocation.

### Error Handling

On any unhandled error the Prisma transaction rolls back — no partial state is written — and the script exits with a non-zero code.

### Rollout Procedure

Run the migration against **stage first**. Do not run the production migration until the stage run has been validated end-to-end.

#### 1. Stage run

```bash
PG_DATABASE_URL_MEDIA="<stage connection string>" nx run api-media:migrate-hindu-buddhist-tags
```

#### 2. Stage verification

**UI:** Log in to the stage admin, open a template's Audience checkbox list, and confirm:

- `Hindu/Buddist` is no longer listed.
- `Hindu` and `Buddhist` are listed as separate options.
- Every template that previously carried the combined tag now shows **both** `Hindu` and `Buddhist` ticked.

**SQL verification** (against the stage `media` database):

```sql
-- Must return 0 rows.
SELECT * FROM "Tag" WHERE name = 'Hindu/Buddist';

-- Must return 2 rows, both with parentId equal to the Audience tag's id.
SELECT t.id, t.name, t."parentId"
FROM "Tag" t
WHERE t.name IN ('Hindu', 'Buddhist');

-- Row count must be exactly 2 × (number of templates that had the legacy tag).
SELECT COUNT(*) FROM "Tagging" tg
JOIN "Tag" t ON t.id = tg."tagId"
WHERE t.name IN ('Hindu', 'Buddhist');
```

#### 3. Production run

Only after every stage check passes:

```bash
PG_DATABASE_URL_MEDIA="<prod connection string>" nx run api-media:migrate-hindu-buddhist-tags
```

#### 4. Production verification

Repeat the same UI and SQL checks against the production database.
