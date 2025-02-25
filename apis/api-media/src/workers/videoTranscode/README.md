# Video Transcode Worker

This worker handles video transcoding jobs using BullMQ and the media-transcoder service.

## Overview

The video transcode worker:

1. Receives transcoding requests from the `transcodeVideo` GraphQL mutation
2. Adds jobs to a BullMQ queue
3. The media-transcoder service processes these jobs to transcode videos

## Job Data Structure

Each job contains the following data:

```typescript
interface TranscodeVideoJobData {
  videoId?: string // Optional ID of the video to transcode
  inputUrl: string // URL of the video to transcode
  format: string // Output format (e.g., "mp4", "webm")
  resolution: string // Output resolution (e.g., "720p", "1080p")
  bitrate?: number // Output bitrate in kbps
  outputBucket?: string // S3 bucket to store the transcoded video
  outputKey?: string // S3 key to store the transcoded video
  taskArn?: string // Task ARN if using ECS
}
```

## Queue Configuration

The queue is configured with:

- Job retention: Completed jobs are removed after 1 hour
- Failed job retention: Failed jobs are removed after 1 day (max 50 jobs)
- Retry attempts: 3 attempts with exponential backoff

## Integration with media-transcoder

The media-transcoder service:

1. Pulls jobs from the queue
2. Uses ffmpeg to transcode the video
3. Uploads the transcoded video to the specified storage
4. Reports job completion status

## Environment Variables

The following environment variables are required:

- `REDIS_URL`: Redis server URL
- `REDIS_PORT`: Redis server port

## Usage

The worker is automatically started when the API server starts. Jobs can be added to the queue using the `addTranscodeVideoJob` function:

```typescript
import { addTranscodeVideoJob } from './workers/videoTranscode/queue'

const jobId = await addTranscodeVideoJob({
  videoId: 'video-123', // Optional
  inputUrl: 'https://example.com/video.mp4',
  format: 'mp4',
  resolution: '1080p',
  bitrate: 5000
})
```
