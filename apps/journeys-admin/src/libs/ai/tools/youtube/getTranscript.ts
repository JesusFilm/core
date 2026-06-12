import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { YoutubeTranscript } from '@danielxceron/youtube-transcript'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { ToolOptions } from '..'

// Type for a single transcript segment
export type YouTubeTranscriptSegment = {
  text: string
  start: number // start time in seconds
  duration: number // duration in seconds
}

// Type for the transcript result
export type YouTubeTranscript = YouTubeTranscriptSegment[]

// Zod schema for a single transcript segment
export const youTubeTranscriptSegmentSchema = z.object({
  text: z.string(),
  start: z.number(),
  duration: z.number()
})

// Zod schema for the transcript result
export const youTubeTranscriptSchema = z.array(youTubeTranscriptSegmentSchema)

function extractYouTubeVideoId(input: string): string | null {
  // If input is already an 11-char video ID, return as-is
  if (/^[\w-]{11}$/.test(input)) return input
  // Otherwise, try to extract from URL
  const match = input.match(
    /(?:v=|vi=|youtu\.be\/|\/v\/|embed\/|shorts\/|\/watch\?v=|\/watch\?.+&v=)([\w-]{11})/
  )
  if (match) return match[1]
  // Fallback: try generic 11-char match
  const generic = input.match(/([\w-]{11})/)
  return generic ? generic[1] : null
}

/**
 * Tool factory for fetching YouTube video transcripts. Note: this is a third-party
 * tool that is not used in the AI tools system, it was for prototyping. It ONLY works locally
 * @param client ApolloClient instance (not used in stub)
 * @param _options ToolOptions (not used in stub)
 * @returns Tool for the AI tools system
 */
export function youTubeTranscriptTool(
  client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
): Tool {
  return tool({
    description:
      'Fetches the transcript for a YouTube video by ID or URL and returns an array of segments (text, start, duration in seconds).',
    parameters: z.object({
      videoIdOrUrl: z.string().describe('The YouTube video ID or URL.')
    }),
    execute: async ({ videoIdOrUrl }) => {
      const videoId = extractYouTubeVideoId(videoIdOrUrl)
      if (!videoId) {
        throw new Error('Invalid YouTube video ID or URL')
      }
      let transcript
      try {
        transcript = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: 'en'
        })
      } catch (err) {
        throw new Error('Could not fetch transcript for this video')
      }
      // Map {text, duration, offset} to {text, duration, start}
      const mapped = transcript.map(({ text, duration, offset }) => ({
        text,
        duration,
        start: offset
      }))
      // Validate and map to our type
      const result = youTubeTranscriptSchema.safeParse(mapped)
      if (!result.success) {
        throw new Error('Transcript format is invalid')
      }
      return result.data
    }
  })
}
