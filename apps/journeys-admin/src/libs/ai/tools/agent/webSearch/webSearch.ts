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
      searchQuery: z
        .string()
        .describe(
          'The query to search the web for. Will find a number of websites to scrape.'
        ),
      prompt: z
        .string()
        .describe(
          'The prompt to use to scrape the website. Should direct the agent on what elements to focus on.'
        )
    }),
    execute: async ({ searchQuery, prompt }) => {
      const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

      console.log('Searching the web for:', searchQuery)

      const searchResult = await app.search(searchQuery, {
        limit: 1,
        maxAge: 3600000 // 1 hour in milliseconds
      })

      console.log('searchResult.data', searchResult.data)

      if (!searchResult.success) {
        throw new Error(`Failed to search: ${searchResult.error}`)
      }

      if (searchResult.data.length === 0) {
        throw new Error('No results found')
      }

      const extractResult = await app.extract(
        [`${searchResult.data[0].url.replace(/\/$/, '')}/*`],
        {
          prompt,
          schema
        }
      )

      console.log('extractResult.data', extractResult.data)

      if (!extractResult.success) {
        throw new Error(`Failed to extract: ${extractResult.error}`)
      }

      return extractResult.data
    }
  })
}
