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

## Copy Distro Downloads Script

The copy distro downloads script copies existing VideoVariantDownloads to their matched distro downloads. This is useful for creating distribution center versions of video downloads.

### Usage

```bash
nx run api-media:copy-distro-downloads
```

### Process

The script will:

1. Find all VideoVariantDownloads with qualities: `low`, `sd`, `high`
2. For each download, create corresponding downloads:
   - `low` → `distroLow`
   - `sd` → `distroSd`
   - `high` → `distroHigh` + `highest`
3. Process downloads in batches of 1000 for optimal performance
4. Preserve all original metadata (size, dimensions, bitrate, etc.)

### Quality Mapping

| Original Quality | Target Qualities    |
| ---------------- | ------------------- |
| low              | distroLow           |
| sd               | distroSd            |
| high             | distroHigh, highest |

### Error Handling

The script includes error handling for:

- Database connection issues
- Batch processing failures
- Progress tracking and reporting

If any error occurs, the script will exit with a non-zero code and display an appropriate error message.
