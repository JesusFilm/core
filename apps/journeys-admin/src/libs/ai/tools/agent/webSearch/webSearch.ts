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
  url: z.string().describe('The URL of the website.'),
  content: z
    .string()
    .describe('The content of the website in markdown format.'),
  logo: imageSchema.describe('The logo of the website.'),
  images: z.array(imageSchema).describe('The images available on the website.')
})

export function agentWebSearch(
  _client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
): Tool {
  return tool({
    parameters: z.object({
      prompt: z.string().describe('The query to search the web for.')
    }),
    execute: async ({ prompt }) => {
      const app = new FirecrawlApp()

      const searchResult = await app.search(prompt, {
        limit: 1
      })

      if (!searchResult.success) {
        throw new Error(`Failed to search: ${searchResult.error}`)
      }

      if (searchResult.data.results.length === 0) {
        return 'No results found'
      }

      const url = searchResult.data.results[0].url

      const scrapeResult = await app.scrapeUrl(url, {
        formats: ['markdown'],
        maxAge: 3600000, // 1 hour in milliseconds
        jsonOptions: { schema: schema }
      })

      if (!scrapeResult.success) {
        throw new Error(`Failed to scrape: ${scrapeResult.error}`)
      }

      console.log(scrapeResult.json)

      return scrapeResult.json
    }
  })
}
