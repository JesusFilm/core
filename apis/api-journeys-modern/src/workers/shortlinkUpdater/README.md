# Shortlink Updater Worker

This worker is responsible for updating shortlinks that point to journeys. It ensures that when a journey's slug changes, any associated shortlinks remain valid.

## Purpose

In the JesusFilm platform, journeys can have QR codes that link to them via shortlinks. When a journey's slug changes, these shortlinks need to be updated to point to the new URL. This worker handles that process automatically for all journeys in the system.

## Jobs

The worker handles one type of job:

1. **updateAllShortlinks**: Updates all shortlinks in the system
   - Useful for bulk operations or migrations
   - Finds all journeys with QR codes and updates their shortlinks to use the current journey slugs

## CLI Usage

You can manually trigger the worker using the CLI:

```bash
# Update all shortlinks
npx ts-node src/workers/cli.ts shortlink-updater
```

Or using the npm script:

```bash
# Update all shortlinks
nx run api-journeys-modern:update-shortlinks
```

### Direct CLI Tool

A direct CLI tool is also available that bypasses the queue system and runs the shortlink updates directly:

```bash
# Update all shortlinks
npx ts-node src/workers/shortlinkUpdater/cli.ts
```

Or using the npm script:

```bash
# Update all shortlinks
nx run api-journeys-modern:shortlink-cli
```

## Scheduled Operation

The worker is automatically scheduled to run daily at 3 AM to check and update all shortlinks. This ensures that any outdated shortlinks are fixed automatically.

## Implementation Details

The worker:

1. Queries the database to find all journeys that have QR codes
2. For each journey, it:
   - Processes all associated QR codes
   - Gets the current shortlink information for each QR code
   - Builds a new URL using the journey's current slug
   - Updates the shortlink to point to the new URL

The worker handles errors gracefully and continues processing other journeys even if one fails to update.

## Environment Variables

The worker requires the following environment variables:

- `GATEWAY_URL`: URL of the GraphQL gateway
- `INTEROP_TOKEN`: Token for internal service communication
- `JOURNEYS_URL`: Base URL for journey paths
- `SERVICE_VERSION`: Version of the service (optional)
