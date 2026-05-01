import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { GraphQLError } from 'graphql'

import { CustomDomain, prisma } from '@core/prisma/journeys/client'
import { graphql } from '@core/shared/gql'

import { env } from '../../env'

const UPDATE_SHORT_LINK = graphql(`
  mutation CustomDomainServiceShortLinkUpdate(
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

function createApolloClient(): ApolloClient<unknown> {
  const httpLink = createHttpLink({
    uri: env.GATEWAY_URL,
    headers: {
      'interop-token': env.INTEROP_TOKEN,
      'x-graphql-client-name': 'api-journeys-modern',
      'x-graphql-client-version': env.SERVICE_VERSION
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  })
}

export async function deleteVercelDomain({
  name
}: CustomDomain): Promise<boolean> {
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

async function buildJourneyUrl(
  shortLinkId: string,
  teamId: string,
  journeyId: string,
  blockId?: string | null,
  newCustomDomain?: string
): Promise<string> {
  const journey = await prisma.journey.findUniqueOrThrow({
    where: { id: journeyId }
  })

  const customDomain = (
    await prisma.customDomain.findMany({
      where: { teamId }
    })
  )[0]

  const customDomainName = newCustomDomain ?? customDomain?.name

  const base =
    customDomainName != null ? `https://${customDomainName}` : env.JOURNEYS_URL

  const blockPath = blockId != null ? `/${blockId}` : ''
  const path = `${journey.slug}${blockPath}`
  const utm = `?utm_source=ns-qr-code&utm_campaign=${shortLinkId}`

  return `${base}/${path}${utm}`
}

export async function updateTeamShortLinks(
  teamId: string,
  customDomainName: string
): Promise<void> {
  const apollo = createApolloClient()

  const qrCodes = await prisma.qrCode.findMany({
    where: { teamId }
  })

  for (const qrCode of qrCodes) {
    if (qrCode.journeyId !== qrCode.toJourneyId) continue

    const to = await buildJourneyUrl(
      qrCode.id,
      qrCode.teamId,
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
