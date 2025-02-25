# Video Transcoding Mutation

The `transcodeVideo` mutation allows publishers to queue a video transcoding job.

## Usage

```graphql
mutation TranscodeVideo($input: TranscodeVideoInput!) {
  transcodeVideo(input: $input) {
    taskArn
    videoId
    status
  }
}
```

## Input

The `TranscodeVideoInput` type has the following fields:

- `inputUrl` (required): The URL of the video to transcode
- `videoId` (optional): The ID of the video to associate with the transcoding job
- `format` (required): The output format (e.g., "mp4", "webm")
- `resolution` (required): The output resolution (e.g., "720p", "1080p")
- `bitrate` (optional): The output bitrate in kbps
- `outputBucket` (optional): The S3 bucket to store the transcoded video
- `outputKey` (optional): The S3 key to store the transcoded video

## Response

The `TranscodeVideoResponse` type has the following fields:

- `taskArn`: The ID of the transcoding job
- `videoId`: The ID of the video being transcoded (or "no-video-id" if not provided)
- `status`: The status of the transcoding job (e.g., "QUEUED")

## Environment Variables

The following environment variables must be set:

- `REDIS_URL`: Redis server URL
- `REDIS_PORT`: Redis server port

## Example

```graphql
mutation {
  transcodeVideo(input: { inputUrl: "https://example.com/video.mp4", videoId: "123", format: "mp4", resolution: "1080p", bitrate: 5000, outputBucket: "my-bucket", outputKey: "videos/123.mp4" }) {
    taskArn
    videoId
    status
  }
}
```
