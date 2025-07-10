# ENG-2822-VIDEO: AI-Powered Video Journey with Poll and Reflection Cards

## Overview

This PRD defines the requirements and implementation plan for enabling AI-powered journeys that incorporate YouTube video segments, poll cards, and reflection cards. The goal is to allow users to provide a YouTube link and prompt, and have the AI generate an interactive journey that alternates between video segments and engagement cards, using the transcript to inform segmentation and content.

## Problem Statement

Current journey creation does not support:

- Segmenting YouTube videos into multiple cards with start/end times.

- Automated transcript analysis for content segmentation.

- Inserting poll or reflection cards between video segments based on video content.

This limits the ability to create rich, interactive, video-driven journeys similar to the "Alpha" series or other guided video experiences.

## Requirements

### Functional Requirements

1. **Video Block Support in Simple Journey Types**

- Add a minimal `video` field to the `JourneySimpleCard` schema and type in `/libs/shared/ai/src/journeySimpleTypes.ts`.

- Fields: `url` (YouTube link or ID), `startAt` (seconds), `endAt` (seconds).

2. **Backend Support for Video Blocks**

- Update `/apis/api-journeys-modern/src/schema/journey/simple/updateSimpleJourney.ts` to:

- Accept cards with a `video` field in the simple journey JSON.

- Transform the simple `video` block into the backend `VideoBlock` structure (mapping `url` to `videoId`, `startAt`, `endAt`, and setting `source` to `youTube`).

- Update `/apis/api-journeys-modern/src/schema/journey/simple/simplifyJourney.ts` to:

- Map backend `VideoBlock` fields back to the simple `video` field when simplifying journeys.

3. **YouTube Transcript Tool**

- Implement `/apps/journeys-admin/src/libs/ai/tools/youtubeTranscript.ts` (new).

- Use the `youtube-transcript` NPM package to fetch transcripts for a given YouTube video URL or ID.

- Return transcript as an array of segments: `{ text, offset, duration }`.

- Handle errors gracefully (e.g., transcript not available).

4. **AI Orchestration via System Prompt**

- Update the system prompt to instruct the AI:

- When a YouTube link is provided, first call the YouTube Transcript Tool.

- Use the transcript to segment the video and generate journey cards, alternating between video, poll, and reflection cards as appropriate.

- Only use poll and reflection cards for user interaction (no open-ended questions).

- Call the Simple Journey Update Tool to save the journey with the new video blocks.

### Non-Functional Requirements

- **Incremental Development:**

- Steps 1 and 2 can be completed and tested independently of transcript fetching.

- Manual journeys with video blocks should be supported before transcript automation is added.

- **Validation:**

- The backend must validate the presence and structure of the `video` field in the simple journey JSON.

- **Error Handling:**

- Clear errors for missing/invalid transcripts or unsupported video formats.

- **Extensibility:**

- The schema and backend logic should allow for future enhancements (e.g., additional video sources, more advanced video block fields).

## Implementation Plan

1. **Update Journey Simple Types**

- File: `/libs/shared/ai/src/journeySimpleTypes.ts`

- Add a new `video` field to the `JourneySimpleCard` Zod schema and type:

- `url` (string): The YouTube video URL or ID.

- `startAt` (number): Start time in seconds.

- `endAt` (number): End time in seconds.

2. **Update the Backend**

- Files:

- `/apis/api-journeys-modern/src/schema/journey/simple/updateSimpleJourney.ts`

- `/apis/api-journeys-modern/src/schema/journey/simple/simplifyJourney.ts`

- Accept and process cards with `video` fields.

- Transform between simple `video` blocks and backend `VideoBlock` structures.

- Ensure round-tripping works for journeys with video blocks.

3. **Implement YouTube Transcript Tool**

- File: `/apps/journeys-admin/src/libs/ai/tools/youtubeTranscript.ts` (new)

- Use `youtube-transcript` NPM package to fetch and return transcript segments.

- Return array of `{ text, offset, duration }`.

- Handle errors gracefully.

4. **AI Orchestration via System Prompt**

- Update the system prompt to:

- Instruct the AI to call the transcript tool when a YouTube link is present.

- Use the transcript to generate video, poll, and reflection cards.

- Only use poll and reflection cards for user interaction.

- Call the Simple Journey Update Tool to save the journey.

## Example Journey Simple Card with Video Block

```json
{
  "id": "card-1",

  "video": {
    "url": "https://youtube.com/watch?v=abc123",

    "startAt": 120,

    "endAt": 180
  },

  "defaultNextCard": "card-2"
}
```

## Success Metrics

- Journeys can be created with video blocks and render correctly in the frontend.

- AI can generate journeys from YouTube links, segmenting video and inserting poll/reflection cards.

- No open-ended question cards are generated.

- Transcript tool reliably fetches and returns transcript segments for supported YouTube videos.

## Risks & Mitigations

- **Transcript Unavailability:**

- Mitigation: Return clear errors and allow manual journey creation with video blocks.

- **YouTube API Changes:**

- Mitigation: Monitor and update the transcript tool as needed; fallback to manual entry if broken.

- **Backend/Frontend Mismatch:**

- Mitigation: Validate and test round-tripping of video blocks between backend and simple JSON.

## Future Enhancements

- Support for additional video sources (e.g., Vimeo, internal uploads).

- More advanced video block fields (e.g., captions, poster images).

- AI-generated summaries or context for each video segment.

- Analytics on poll responses and user engagement.
