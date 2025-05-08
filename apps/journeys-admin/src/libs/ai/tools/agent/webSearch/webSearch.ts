import { openai } from '@ai-sdk/openai'
import { Tool, generateText, tool } from 'ai'
import { z } from 'zod'

const INITIAL_WEB_SEARCH_SYSTEM_PROMPT = `
YOU SHOULD ALWAYS RESPOND IN MARKDOWN FORMAT.

You are a helpful assistant that searches the web for information.

# Searching for churches

When asked to find information about a church, you should find their website
then scrape the website for the information you need. You could return things
like the church's website, social media, phone number, address, service times
etc. You should try and discover the church's color palette, logo, and other
details that you can use to style the church's related content. If possible,
try to link the church's key images by returning URLs of a few images. You
should also try and find the church's key people and return their names,
titles, and a link to their profile.

If the prompt includes a SCOPED_URL, you should scope your results to the
domain of the URL.

# Searching for other information

When asked to find information about something else, you should search the web
for the information you need.
`

export function agentWebSearch(): Tool {
  return tool({
    parameters: z.object({
      prompt: z.string().describe('The query to search the web for.'),
      url: z.string().describe('The URL to scope your results to.').optional()
    }),
    execute: async ({ prompt, url }) => {
      const result = await generateText({
        model: openai.responses('gpt-4o-mini'),
        system: INITIAL_WEB_SEARCH_SYSTEM_PROMPT,
        prompt: `${url ? `\n\nSCOPED_URL: ${url}` : ''} ${prompt}`,
        tools: {
          web_search_preview: openai.tools.webSearchPreview({
            searchContextSize: 'high'
          })
        },
        toolChoice: { type: 'tool', toolName: 'web_search_preview' }
      })

      console.log('WEB SEARCH QUERY', prompt)
      console.log('SCOPED_URL', url)
      console.log('WEB SEARCH RESULT', result.text)
      return result.text
    }
  })
}
