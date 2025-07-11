import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Tool, tool } from 'ai'
import { google } from 'googleapis'
import { z } from 'zod'

import { ToolOptions } from '..'

// A utility function to extract the video ID from a YouTube URL
const getYouTubeVideoId = (url: string) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=))(.*?)(?:&|$)/
  )
  return match ? match[1] : null
}

// Broken - would need youtube api key to work. likely would not return transcript either
export function youtubeAnalyzerTool(
  client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
): Tool {
  return tool({
    description:
      'Analyzes a YouTube video by fetching its metadata and transcript.',
    parameters: z.object({
      url: z.string().describe('The full URL of the YouTube video to analyze.')
    }),
    execute: async ({ url }) => {
      const videoId = getYouTubeVideoId(url)
      if (!videoId) {
        throw new Error('Invalid YouTube URL provided.')
      }

      const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
      })

      try {
        const videoResponse = await youtube.videos.list({
          part: ['snippet', 'contentDetails', 'statistics'],
          id: [videoId]
        })

        const videoData = videoResponse.data.items?.[0]
        if (!videoData) {
          return 'Could not find video data for the provided URL.'
        }

        const { snippet, contentDetails, statistics } = videoData

        // Placeholder for getting the transcript.
        // This would require another API or library (e.g., youtube-captions-scraper).
        // For simplicity, we'll just acknowledge it here.
        const transcript =
          'Transcript data retrieval is a separate step not yet implemented.'

        return {
          title: snippet?.title,
          description: snippet?.description,
          duration: contentDetails?.duration,
          viewCount: statistics?.viewCount,
          likeCount: statistics?.likeCount,
          commentCount: statistics?.commentCount,
          tags: snippet?.tags,
          transcript: transcript
        }
      } catch (error) {
        console.error('Error fetching YouTube video data:', error)
        return 'An error occurred while fetching video data.'
      }
    }
  })
}
