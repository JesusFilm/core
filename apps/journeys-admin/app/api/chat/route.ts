import { openai } from '@ai-sdk/openai'
import { gql } from '@apollo/client'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

// Allow streaming responses up to 30 seconds
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

import { tools } from '../../../src/libs/ai/tools'
import { createApolloClient } from '../../../src/libs/apolloClient'

export const maxDuration = 30

export const runtime = 'edge'

const GET_ADMIN_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetAdminJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const token = req.cookies.get('journeys-admin.AuthUser')

  if (token?.value == null)
    return Response.json({ error: 'Missing token' }, { status: 400 })

  const apolloClient = createApolloClient(token.value)

  const result = streamText({
    model: openai('gpt-4'),
    messages,
    tools: {
      ...tools,
      getJourney: {
        ...tools.getJourney,
        execute: async ({ journeyId }) => {
          const result = await apolloClient.query({
            query: GET_ADMIN_JOURNEY,
            variables: { id: journeyId }
          })
          return result.data?.journey
        }
      }
    }
  })
  return result.toDataStreamResponse()
}
