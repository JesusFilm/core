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
