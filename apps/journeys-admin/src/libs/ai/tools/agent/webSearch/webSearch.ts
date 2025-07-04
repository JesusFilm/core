import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import FirecrawlApp from '@mendable/firecrawl-js'
import { Tool, tool } from 'ai'
import { z } from 'zod'

import { ToolOptions } from '../..'

const imageSchema = z.object({
  url: z.string().describe('The URL of the image.'),
  alt: z.string().describe('The alt text of the image.'),
  width: z.number().describe('The width of the image.'),
  height: z.number().describe('The height of the image.')
})

const schema = z.object({
  title: z.string().describe('The title of the website.'),
  description: z.string().describe('The description of the website.'),
  url: z.string().describe('The main URL of the website.'),
  keyLinks: z
    .array(
      z.object({
        url: z.string().describe('The URL of the key link.'),
        title: z.string().describe('The title of the key link.')
      })
    )
    .describe('The key links of the website.'),
  content: z
    .array(z.string().describe('The content of the page in markdown format.'))
    .describe('A number of scraped pages from the website in markdown format.'),
  logo: imageSchema.describe(
    'The logo of the website. Is often found in the header of the website.'
  ),
  images: z.array(imageSchema).describe('The images available on the website.')
})

export function agentWebSearch(
  _client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
): Tool {
  return tool({
    parameters: z.object({
      prompt: z
        .string()
        .describe(
          'The query to search the web for. Will find a number of websites to scrape.'
        )
    }),
    execute: async ({ prompt }) => {
      const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

      const searchResult = await app.search(prompt, {
        limit: 5
      })

      if (!searchResult.success) {
        throw new Error(`Failed to search: ${searchResult.error}`)
      }

      if (searchResult.data.length === 0) {
        throw new Error('No results found')
      }

      const extractResult = await app.extract(
        searchResult.data.map(({ url }) => url),
        {
          limit: 5,
          maxAge: 3600000, // 1 hour in milliseconds
          schema
        }
      )

      if (!extractResult.success) {
        throw new Error(`Failed to extract: ${extractResult.error}`)
      }

      return extractResult.data
    }
  })
}
