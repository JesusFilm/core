import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API route called with method:', req.method)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')

    console.log('Connecting to real GraphQL subscription...')

    // Create the GraphQL subscription query
    const subscriptionQuery = {
      query: `
        subscription JourneyAiTranslateCreate($input: JourneyAiTranslateInput!) {
          journeyAiTranslateCreate(input: $input) {
            progress
            message
            journey {
              id
              title
              description
            }
          }
        }
      `,
      variables: {
        input: {
          journeyId: 'ef76c255-55b3-4a3b-92a3-418f0ea5cb98',
          name: 'Fact or Fiction',
          journeyLanguageName: '',
          textLanguageId: '1109',
          textLanguageName: 'Hrvatski'
        }
      }
    }

    console.log('Making request to journeys-modern GraphQL endpoint...')

    // Forward the request to journeys-modern service
    const response = await fetch('http://localhost:4004/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(subscriptionQuery)
    })

    console.log('Response status:', response.status)
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    )

    if (!response.ok) {
      console.error('Error response from journeys-modern:', response.statusText)
      res.write(
        `data: ${JSON.stringify({ error: `HTTP ${response.status}: ${response.statusText}` })}\n\n`
      )
      return res.end()
    }

    if (!response.body) {
      console.error('No response body from journeys-modern')
      res.write(`data: ${JSON.stringify({ error: 'No response body' })}\n\n`)
      return res.end()
    }

    console.log('Starting to stream response...')

    // Stream the response
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    const pump = async (): Promise<void> => {
      try {
        const { done, value } = await reader.read()

        if (done) {
          console.log('Stream completed')
          res.end()
          return
        }

        const chunk = decoder.decode(value, { stream: true })
        console.log('Received chunk:', chunk)

        // Forward the chunk to the client
        res.write(chunk)

        // Continue reading
        void pump()
      } catch (error) {
        console.error('Error reading stream:', error)
        res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
        res.end()
      }
    }

    void pump()
  } catch (error) {
    console.error('API route error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
