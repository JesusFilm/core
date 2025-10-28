# On-Demand Server Functions Patterns

## Overview

This document outlines the established patterns in the monorepo for creating server functions that run on demand, specifically focusing on the video thumbnail generation use case.

## Queue-Based Background Processing Pattern

The monorepo uses **BullMQ** with Redis for all background job processing. Here's the established structure:

### Worker Directory Structure

```
apis/api-media/src/workers/[workerName]/
├── config.ts          # Queue name and job name constants
├── queue.ts           # BullMQ queue instance
├── service/           # Business logic
│   ├── service.ts     # Job processing logic
│   └── service.spec.ts
├── worker.ts          # Worker setup and job handler
└── index.ts           # Exports
```

### Key Components

#### 1. Configuration (`config.ts`)

```typescript
export const queueName = 'api-media-process-video-uploads'
export const jobName = `${queueName}-job`
```

#### 2. Queue Setup (`queue.ts`)

```typescript
import { Queue } from 'bullmq'
import { connection } from '../lib/connection'

export const queue = new Queue(queueName, { connection })
```

#### 3. Service Logic (`service/service.ts`)

```typescript
export async function service(job: Job<JobData>, logger?: Logger): Promise<void> {
  // Business logic here
}
```

#### 4. Worker (`worker.ts`)

```typescript
import { Worker } from 'bullmq'
export const worker = new Worker(queueName, processJob, { connection })

async function processJob(job: Job): Promise<void> {
  await service(job, childLogger)
}
```

## Job Triggering Pattern

Jobs are typically triggered through **GraphQL mutations** that add jobs to queues:

```typescript
await processVideoUploadsQueue.add(
  processVideoUploadsJobName,
  {
    videoId,
    edition,
    languageId
    // ... job data
  },
  {
    jobId: `unique-job-id`,
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: { age: FIVE_DAYS, count: 50 }
  }
)
```

## Video Processing Context

For video thumbnails specifically:

- **Existing Processing**: Videos go through `processVideoUploads` worker that handles Mux video processing
- **Image Storage**: Uses Cloudflare Images API with transformations (`mobileCinematicHigh`, `thumbnail`, `videoStill`)
- **Current Display**: VideoCard component shows thumbnails via `data.images?.[0]?.mobileCinematicHigh`

## Recommended Implementation for Thumbnail Generation

You would create a new worker following this pattern:

1. **New Worker**: `apis/api-media/src/workers/generateVideoThumbnails/`
2. **Queue**: `'api-media-generate-video-thumbnails'`
3. **Service Logic**: Check database for existing thumbnails, generate if missing
4. **Trigger**: GraphQL mutation that checks current thumbnail status and queues generation if needed

## Production Considerations

- **Leader Election**: In production, workers use leader election to avoid duplicate processing
- **Redis Connection**: Shared connection config across all workers
- **Error Handling**: Exponential backoff, retry limits, cleanup policies
- **Logging**: Structured logging with Pino throughout the pipeline

This pattern ensures reliable, scalable on-demand processing that integrates seamlessly with the existing video pipeline.
