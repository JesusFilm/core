import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Tool, tool } from 'ai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { videoSubtitleContentSchema } from '@core/shared/ai/videoSubtitleTypes'

import { ToolOptions } from '../index'

function getSchemaDescription(schema: typeof videoSubtitleContentSchema): string {
  const jsonSchema = zodToJsonSchema(schema)
  return JSON.stringify(jsonSchema, null, 2)
}

export const LOAD_VIDEO_SUBTITLE_CONTENT = gql`
  query LoadVideoSubtitleContent($videoId: ID!, $languageId: ID!) {
    video(id: $videoId) {
      id
      variant(languageId: $languageId) {
        id
        subtitle {
          id
          languageId
          edition
          primary
          srtSrc
        }
      }
    }
  }
`

/**
 * Fetches the content of an SRT file from a given URL
 * @param srtSrc The URL of the SRT file
 * @returns The content of the SRT file as a string
 */
async function fetchSrtContent(srtSrc: string): Promise<string> {
  try {
    const response = await fetch(srtSrc)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch SRT content: ${response.status} ${response.statusText}`)
    }
    
    const content = await response.text()
    return content
  } catch (error) {
    throw new Error(`Error fetching SRT content from ${srtSrc}: ${error.message}`)
  }
}

export function loadVideoSubtitleContent(
  client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
): Tool {
  return tool({
    description:
      'Fetches video subtitle data by video ID and language ID and returns a validated JSON structure including srtSrc content URL.' +
      '\n\nOutput schema (auto-generated from Zod):\n' +
      getSchemaDescription(videoSubtitleContentSchema),
    parameters: z.object({
      videoId: z.string().describe('The ID of the video to fetch subtitle for.'),
      languageId: z.string().describe('The language ID of the subtitle to fetch.')
    }),

    execute: async ({ videoId, languageId }) => {
      try {
        const result = await client.query({
          query: LOAD_VIDEO_SUBTITLE_CONTENT,
          variables: { videoId, languageId },
          errorPolicy: 'all',
          fetchPolicy: 'no-cache'
        })

        const data = result.data
        const subtitles = data.video?.variant?.subtitle || []
        
        const validSubtitles = subtitles.filter((sub: any) => {
          return sub && 
                 typeof sub === 'object' && 
                 sub.id && 
                 typeof sub.id === 'string' &&
                 sub.languageId &&
                 typeof sub.languageId === 'string' &&
                 sub.languageId === languageId
        })
        
        const subtitle = validSubtitles[0]
        
        if (!subtitle) {
          throw new Error(`No subtitle found for video ${videoId} and language ${languageId}`)
        }

        // Always fetch SRT content if srtSrc exists
        if (subtitle.srtSrc) {
          try {
            const srtContent = await fetchSrtContent(subtitle.srtSrc)
            subtitle.srtContent = srtContent
          } catch (error) {
            console.warn(`Failed to fetch SRT content: ${error.message}`)
            // Continue without srtContent if fetch fails
          }
        }

        const validationResult = videoSubtitleContentSchema.safeParse(subtitle)
        if (!validationResult.success) {
          throw new Error(
            'Returned subtitle is invalid: ' +
              JSON.stringify(validationResult.error.format())
          )
        }

        return validationResult.data
      } catch (error) {
        console.error('Error in loadVideoSubtitleContent:', error.message)
        throw error
      }
    }
  })
} 