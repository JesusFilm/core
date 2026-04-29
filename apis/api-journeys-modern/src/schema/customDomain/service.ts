import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'
import { graphql } from '@core/shared/gql'

const DOMAIN_REGEX =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z]$/

interface VercelCreateDomainResponse {
  name: string
  apexName: string
}

interface VercelCreateDomainError {
  error: {
    code: string
    message: string
  }
}

export function isDomainValid(domain: string): boolean {
  return DOMAIN_REGEX.test(domain)
}

export async function createVercelDomain(
  name: string
): Promise<VercelCreateDomainResponse> {
  if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null)
    return { name, apexName: name }

  const response = await fetch(
    `https://api.vercel.com/v10/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
    {
      body: JSON.stringify({ name }),
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      },
      method: 'POST'
    }
  )

  const data: VercelCreateDomainResponse | VercelCreateDomainError =
    await response.json()

  if ('error' in data) {
    switch (response.status) {
      case 400:
        throw new GraphQLError(data.error.message, {
          extensions: { code: 'BAD_USER_INPUT', vercelCode: data.error.code }
        })
      case 409:
        throw new GraphQLError(data.error.message, {
          extensions: { code: 'CONFLICT', vercelCode: data.error.code }
        })
      default:
        throw new GraphQLError('vercel response not handled', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
    }
  }
  return data
}

export async function deleteVercelDomain(name: string): Promise<boolean> {
  if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null) return true

  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains/${name}?teamId=${process.env.VERCEL_TEAM_ID}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      },
      method: 'DELETE'
    }
  )

  switch (response.status) {
    case 200:
    case 404:
      return true
    default:
      throw new GraphQLError('vercel response not handled', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
  }
}

const UPDATE_SHORT_LINK = graphql(`
  mutation shortLinkUpdateForCustomDomain(
    $input: MutationShortLinkUpdateInput!
  ) {
    shortLinkUpdate(input: $input) {
      ... on ZodError {
        message
      }
      ... on NotFoundError {
        message
      }
      ... on MutationShortLinkUpdateSuccess {
        data {
          id
          to
        }
      }
    }
  }
`)

function createGatewayClient(): ApolloClient<unknown> {
  const httpLink = createHttpLink({
    uri: process.env.GATEWAY_URL,
    headers: {
      'interop-token': process.env.INTEROP_TOKEN ?? '',
      'x-graphql-client-name': 'api-journeys-modern',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  })
}

async function buildShortLinkTo(
  shortLinkId: string,
  toJourneyId: string,
  toBlockId: string | null,
  customDomainName: string
): Promise<string> {
  const journeysUrl = process.env.JOURNEYS_URL
  if (journeysUrl == null)
    throw new GraphQLError('Journeys url not configured', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  const journey = await prisma.journey.findUniqueOrThrow({
    where: { id: toJourneyId }
  })

  const base = `https://${customDomainName}`
  const blockPath = toBlockId != null ? `/${toBlockId}` : ''
  const path = `${journey.slug}${blockPath}`
  const utm = `?utm_source=ns-qr-code&utm_campaign=${shortLinkId}`

  return `${base}/${path}${utm}`
}

export async function updateTeamShortLinks(
  teamId: string,
  customDomainName: string
): Promise<void> {
  const apollo = createGatewayClient()

  const qrCodes = await prisma.qrCode.findMany({
    where: { teamId }
  })

  for (const qrCode of qrCodes) {
    if (qrCode.journeyId !== qrCode.toJourneyId) continue

    const to = await buildShortLinkTo(
      qrCode.id,
      qrCode.toJourneyId,
      qrCode.toBlockId,
      customDomainName
    )

    await apollo.mutate({
      mutation: UPDATE_SHORT_LINK,
      variables: {
        input: { id: qrCode.shortLinkId, to }
      }
    })
  }
}
