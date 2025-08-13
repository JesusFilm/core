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
          model: 'gemini-2.5-flash',
          contents: [
            {
              text: `Analyze the video and divide it into meaningful sections based on content or topic changes.

              For each section, provide:
              - A summary that captures the **core message or essence** of the section.
              - One or more **reflective questions** that can be used following the video to get user input.
              - A start and end timestamp in "MM:SS" or "HH:MM:SS" format.
              - The timestamps of each section do not need to be contiguous.
              - The end timestamp should not be greater than the video duration.
              
              Output your response as **JSON** using this exact structure:
              
              [
                {
                  "section": "1",
                  "start": "00:00",
                  "end": "01:10",
                  "summary": "The speaker introduces the idea of identity being shaped by community and relationships.",
                  "questions": [
                    "Who has influenced how I see myself?",
                    "What communities have shaped my identity most?"
                  ]
                },
                {
                  "section": "2",
                  "start": "02:45",
                  "end": "04:00",
                  "summary": "This part explores the tension between personal ambition and collective responsibility.",
                  "questions": [
                    "Where in my life do I prioritize self over others?",
                    "How can I better balance personal goals with service to others?"
                  ]
                }
              ]
              `
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
