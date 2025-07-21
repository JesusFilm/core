import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { GoogleGenAI } from '@google/genai'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { ToolOptions } from '..'

const googleClient = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
})

/**
 * Analyzes a YouTube video using Gemini 2.0 Flash and returns the transcript.
 * @param client - The Apollo client.
 * @param _options - The tool options.
 * @returns The tool.
 */
export function youtubeAnalyzerTool(
  client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
): Tool {
  return tool({
    description: 'Analyzes a YouTube video.',
    parameters: z.object({
      url: z.string().describe('The full URL of the YouTube video to analyze.')
    }),
    execute: async ({ url }) => {
      try {
        return await googleClient.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [
            {
              text: 'get the transcript of the video'
            },
            {
              fileData: {
                fileUri: url
              }
            }
          ]
        })
      } catch (error) {
        // Optionally log the error here
        return { error: 'Failed to analyze YouTube video.' }
      }
    }
  })
}
