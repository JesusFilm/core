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
  colorPalette: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            'The name of the color and its purpose on the website. E.g. "primary" or "background".'
          ),
        hex: z.string().describe('The hex code of the color.')
      })
    )
    .describe(
      'The color palette of the website. Should be a number of colors that are used on the website.'
    ),
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
          'The query to search the web for. Will find a number of websites to scrape. Only provide searchQuery or url, not both.'
        )
        .optional(),
      url: z
        .string()
        .describe(
          'If you already have a URL to scrape, you can provide it here. Otherwise, the agent will search the web for a number of websites to scrape. Only provide url or searchQuery, not both.'
        )
        .optional(),
      prompt: z
        .string()
        .describe(
          'The prompt to use to scrape the website. Should direct the agent on what elements to focus on.'
        )
    }),
    execute: async ({ searchQuery, url, prompt }) => {
      if (searchQuery && url) {
        throw new Error('Only provide searchQuery or url, not both.')
      }

      if (!searchQuery && !url) {
        throw new Error('Either searchQuery or url must be provided.')
      }

      const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

      let urlToScrape = url

      if (urlToScrape == null && searchQuery != null) {
        const searchResult = await app.search(searchQuery, {
          limit: 1,
          maxAge: 3600000 // 1 hour in milliseconds
        })

        if (!searchResult.success) {
          throw new Error(`Failed to search: ${searchResult.error}`)
        }

        urlToScrape = searchResult.data[0]?.url
      }

      if (urlToScrape == null) {
        throw new Error('No results found')
      }

      const extractResult = await app.extract(
        [`${urlToScrape.replace(/\/$/, '')}/*`],
        {
          prompt,
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
