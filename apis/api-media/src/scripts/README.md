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

## List Mux Videos Script

The list mux videos script fetches and displays the latest videos from your Mux account.

### Usage

```bash
# List latest 10 videos from standard environment (default)
nx run api-media:list-mux-videos

# List latest N videos from standard environment
nx run api-media:list-mux-videos 20

# List latest 10 videos from UGC environment
nx run api-media:list-mux-videos 10 ugc

# List latest N videos from UGC environment
nx run api-media:list-mux-videos 20 ugc
```

### Environment Variables

The script requires the following environment variables:

- `MUX_ACCESS_TOKEN_ID`: Your Mux access token ID (required)
- `MUX_SECRET_KEY`: Your Mux secret key (required)

### Output

The script displays information for each video including:

- Asset ID
- Creation date
- Status (ready, processing, errored)
- Duration in seconds
- Maximum stored resolution
- Playback ID (if available)
- Passthrough data (if available)

### Example Output

```
Fetching latest 10 videos from Mux...

Found 10 videos:

1. Asset ID: abc123def456
   Created: 2024-01-15T10:30:45.000Z
   Status: ready
   Duration: 3600s
   Resolution: 1080p
   Playback ID: xyz789uvw012
   ---
2. Asset ID: def456ghi789
   Created: 2024-01-14T15:20:30.000Z
   Status: processing
   Duration: N/A
   Resolution: N/A
   Playback ID: None
   ---
```

### Error Handling

The script includes error handling for:

- Missing environment variables
- Mux API authentication failures
- Network connectivity issues

If any error occurs, the script will exit with a non-zero code and display an appropriate error message.

## Check Subtitle Status Script

The check subtitle status script retrieves the current status of subtitle generation for a Mux asset and provides direct links to generated subtitles for manual verification.

### Usage

```bash
# Check subtitle status for a specific asset
nx run api-media:check-subtitle-status <asset-id>

# Example with the test asset
nx run api-media:check-subtitle-status mb4L5MM01cC4010102PsZpwd14OvQoOnC01M9QWl52n7H02sE
```

### Output

The script displays detailed information about the asset and its subtitle tracks:

```
🔍 Checking subtitle status for asset: mb4L5MM01cC4010102PsZpwd14OvQoOnC01M9QWl52n7H02sE
📊 Asset Status: ready
⏱️  Duration: 392s
🎬 Playback ID: CTWo2pj6yoMTsFQDR01xRRVvjrmKjSID302jTKpdaNh7Y
📋 Total Tracks: 3

🎭 Subtitle Tracks (1):

📝 Track ID: XIcMM017wTI3ERpAX9vgzGIKvqmJ7UWA00q3srYy0127D6GKbnb8XyJiw
   Status: ready
   Language: ru
   VTT URL: https://stream.mux.com/CTWo2pj6yoMTsFQDR01xRRVvjrmKjSID302jTKpdaNh7Y/text/XIcMM017wTI3ERpAX9vgzGIKvqmJ7UWA00q3srYy0127D6GKbnb8XyJiw.vtt
   🔗 Direct Link: https://stream.mux.com/CTWo2pj6yoMTsFQDR01xRRVvjrmKjSID302jTKpdaNh7Y/text/XIcMM017wTI3ERpAX9vgzGIKvqmJ7UWA00q3srYy0127D6GKbnb8XyJiw.vtt
   ✅ VERIFICATION: curl "https://stream.mux.com/CTWo2pj6yoMTsFQDR01xRRVvjrmKjSID302jTKpdaNh7Y/text/XIcMM017wTI3ERpAX9vgzGIKvqmJ7UWA00q3srYy0127D6GKbnb8XyJiw.vtt"
```

### Features

- **Asset Information**: Status, duration, playback ID, track count
- **Subtitle Track Details**: ID, status, language code
- **Direct VTT Links**: Ready-to-use URLs for manual verification
- **Verification Commands**: Copy-paste ready curl commands to test VTT accessibility

### Environment Variables

- `MUX_ACCESS_TOKEN_ID`: Your Mux access token ID (required)
- `MUX_SECRET_KEY`: Your Mux secret key (required)

## Setup Mux Test Data Script

The setup mux test data script creates a complete test environment for testing the `requestMuxAiSubtitles` GraphQL mutation. It uploads a test video to Mux, waits for processing, and populates your local database with all necessary records.

### Usage

```bash
# Setup and test complete workflow (default)
nx run api-media:setup-mux-test-data

# Use a custom video URL
nx run api-media:setup-mux-test-data "https://example.com/your-test-video.mp4"

# Specify language and user
nx run api-media:setup-mux-test-data "https://example.com/video.mp4" "3934" "user123"

# Setup only (skip subtitle testing)
nx run api-media:setup-mux-test-data --no-test
```

### Environment Variables

The script requires the following environment variables:

- `MUX_ACCESS_TOKEN_ID`: Your Mux access token ID (required)
- `MUX_SECRET_KEY`: Your Mux secret key (required)
- `PG_DATABASE_URL_MEDIA`: Database connection string (required)
- `GATEWAY_URL`: GraphQL API endpoint (defaults to `http://localhost:4000`)
- `AI_SUBTITLE_ADMIN_TOKEN`: Admin token for subtitle operations (defaults to `private-ai-subtitle-generation`)

### Quality Settings

The script uses low-quality settings for faster testing:

- **Video Quality**: `basic` (instead of `plus`)
- **Max Resolution**: `360p` (instead of `1080p`)
- **Static Renditions**: Only `270p` and `360p` (lowest quality options)

### Parameters

1. `videoUrl` (optional): URL of the video to upload. Defaults to Big Buck Bunny test video
2. `languageId` (optional): Language ID for the video. Defaults to "3934" (Russian)
3. `userId` (optional): User ID for the records. Defaults to "system"

### Process

The script will:

1. **Upload Video to Mux**: Create a new Mux asset with the provided video URL (low quality for faster testing)
2. **Wait for Processing**: Poll Mux until the asset is ready (up to 5 minutes)
3. **Create Database Records**:
   - `MuxVideo` record with asset ID and metadata
   - `Video` record (or reuse existing with same slug)
   - `VideoEdition` record for proper foreign key relationships
   - `VideoVariant` record linking everything together
4. **Test Subtitle Generation** (unless `--no-test` is passed):
   - Call `requestMuxAiSubtitles` GraphQL mutation
   - Wait for workflow completion with progress updates (up to 10 minutes)
   - Poll status every 20 seconds with detailed progress information
   - Verify subtitles were generated successfully
5. **Display Results**: Shows complete test results and success/failure status

### Output

The script provides a complete summary including:

- All created record IDs
- Exact parameters for testing `requestMuxAiSubtitles`
- Status updates throughout the process

### Example Output

```
🚀 Starting Mux test data setup...
📹 Video URL: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
👤 User ID: system
🌍 Language ID: 529
📝 Edition: base
📤 Uploading video to Mux...
✅ Created Mux asset: abc123def456
⏳ Waiting for asset to be ready...
✅ Asset is ready!
💾 Creating MuxVideo record...
✅ Created MuxVideo: mux-video-uuid
🎬 Creating/updating Video record...
✅ Created/updated Video: video-uuid
🎭 Creating VideoVariant record...
✅ Created VideoVariant: variant-uuid
🎉 Setup complete!

📋 Test Data Summary:
   Mux Asset ID: abc123def456
   Mux Video ID: mux-video-uuid
   Video ID: video-uuid
   Video Variant ID: variant-uuid

🧪 To test requestMuxAiSubtitles, use these parameters:
   muxVideoId: "mux-video-uuid"
   bcp47: "ru"
   languageId: "3934"
   edition: "base"
   videoVariantId: "variant-uuid"
```

### Testing the AI Subtitles Feature

After running this script, you can test the `requestMuxAiSubtitles` GraphQL mutation:

```graphql
mutation RequestSubtitles($muxVideoId: ID!, $bcp47: String!, $languageId: ID!, $edition: String, $videoVariantId: ID) {
  requestMuxAiSubtitles(
    muxVideoId: $muxVideoId
    bcp47: $bcp47
    languageId: $languageId
    edition: $edition
    videoVariantId: $videoVariantId
  ) {
    id
    status
    trackId
    workflowRunId
  }
}
```

Use the parameters provided by the script in the output.

### Status Monitoring

When testing subtitle generation, the script provides detailed progress updates:

```
⏳ Waiting for subtitle generation to complete...
   Attempt 1/30 (3%): Status "processing" | Elapsed: 20s | Track: XIcMM017wTI3ERpAX9vgzGIKvqmJ7UWA00q3srYy0127D6GKbnb8XyJiw
   Attempt 2/30 (7%): Status "processing" | Elapsed: 40s | Track: XIcMM017wTI3ERpAX9vgzGIKvqmJ7UWA00q3srYy0127D6GKbnb8XyJiw
   Attempt 5/30 (17%): Status "ready" | Elapsed: 100s | Track: XIcMM017wTI3ERpAX9vgzGIKvqmJ7UWA00q3srYy0127D6GKbnb8XyJiw
✅ VTT URL ready: https://stream.mux.com/...
```

**Status Details:**
- **Attempt X/Y**: Current attempt vs maximum attempts (30 total = 10 minutes)
- **Percentage**: Progress through the maximum wait time
- **Status**: Current subtitle track status (`processing`, `ready`, `errored`)
- **Elapsed**: Time spent waiting in seconds
- **Track**: Mux subtitle track ID (when available)

### Error Handling

The script includes comprehensive error handling for:

- Missing environment variables
- Mux API failures
- Asset processing timeouts
- Database operation failures
- Network connectivity issues

If any error occurs, the script will display a detailed error message and exit with a non-zero code.
