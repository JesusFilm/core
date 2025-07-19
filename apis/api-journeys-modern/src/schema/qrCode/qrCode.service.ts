import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { graphql } from 'gql.tada'
import { GraphQLError } from 'graphql'

import { QrCode } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'

// Apollo client for shortlink service interaction
const httpLink = createHttpLink({
  uri: process.env.GATEWAY_URL,
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? '',
    'x-graphql-client-name': 'api-journeys-modern',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

// GraphQL operations for shortlink management
export const GET_SHORT_LINK = graphql(`
  query GetShortLink($id: String!) {
    shortLink(id: $id) {
      ... on NotFoundError {
        message
      }
      ... on QueryShortLinkSuccess {
        data {
          id
          pathname
          to
          domain {
            hostname
          }
        }
      }
    }
  }
`)

export const CREATE_SHORT_LINK = graphql(`
  mutation CreateShortLink($input: MutationShortLinkCreateInput!) {
    shortLinkCreate(input: $input) {
      ... on MutationShortLinkCreateSuccess {
        data {
          id
          pathname
          to
          domain {
            hostname
          }
        }
      }
      ... on NotUniqueError {
        message
      }
      ... on ZodError {
        message
      }
    }
  }
`)

export const UPDATE_SHORT_LINK = graphql(`
  mutation UpdateShortLink($input: MutationShortLinkUpdateInput!) {
    shortLinkUpdate(input: $input) {
      ... on MutationShortLinkUpdateSuccess {
        data {
          id
          pathname
          to
          domain {
            hostname
          }
        }
      }
      ... on NotFoundError {
        message
      }
      ... on ZodError {
        message
      }
    }
  }
`)

export const DELETE_SHORT_LINK = graphql(`
  mutation DeleteShortLink($id: String!) {
    shortLinkDelete(id: $id) {
      ... on MutationShortLinkDeleteSuccess {
        data {
          id
        }
      }
      ... on NotFoundError {
        message
      }
    }
  }
`)

// QR Code Service
export class QrCodeService {
  async createShortLink({
    id,
    hostname,
    to,
    service
  }: {
    id: string
    hostname: string
    to: string
    service:
      | 'apiJourneys'
      | 'apiLanguages'
      | 'apiMedia'
      | 'apiTags'
      | 'apiUsers'
      | 'apiVideos'
  }) {
    const result = await apolloClient.mutate({
      mutation: CREATE_SHORT_LINK,
      variables: {
        input: {
          id,
          hostname,
          to,
          service
        }
      }
    })

    if (
      result.data?.shortLinkCreate.__typename ===
      'MutationShortLinkCreateSuccess'
    ) {
      return result.data.shortLinkCreate
    }

    throw new GraphQLError('Failed to create shortlink', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }

  async updateShortLink({ id, to }: { id: string; to: string }) {
    const result = await apolloClient.mutate({
      mutation: UPDATE_SHORT_LINK,
      variables: {
        input: { id, to }
      }
    })

    if (
      result.data?.shortLinkUpdate.__typename ===
      'MutationShortLinkUpdateSuccess'
    ) {
      return result.data.shortLinkUpdate
    }

    throw new GraphQLError('Failed to update shortlink', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }

  async deleteShortLink(id: string) {
    const result = await apolloClient.mutate({
      mutation: DELETE_SHORT_LINK,
      variables: { id }
    })

    if (
      result.data?.shortLinkDelete.__typename ===
      'MutationShortLinkDeleteSuccess'
    ) {
      return result.data.shortLinkDelete
    }

    throw new GraphQLError('Failed to delete shortlink', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }

  async getTo({
    shortLinkId,
    teamId,
    toJourneyId,
    toBlockId,
    newJourneySlug,
    newCustomDomain
  }: {
    shortLinkId: string
    teamId: string
    toJourneyId: string
    toBlockId?: string
    newJourneySlug?: string
    newCustomDomain?: string
  }): Promise<string> {
    if (process.env.JOURNEYS_URL == null) {
      throw new GraphQLError('Journeys url not added', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }

    const journey = await prisma.journey.findUniqueOrThrow({
      where: { id: toJourneyId }
    })
    const journeySlug = newJourneySlug ?? journey.slug

    const customDomain = (
      await prisma.customDomain.findMany({
        where: { teamId }
      })
    )[0]
    const customDomainName = newCustomDomain ?? customDomain?.name
    const block =
      toBlockId != null
        ? await prisma.block.findUniqueOrThrow({
            where: { journeyId: journey.id, id: toBlockId }
          })
        : null

    const base =
      customDomainName != null
        ? `https://${customDomainName}`
        : process.env.JOURNEYS_URL

    const path = `${journeySlug}${block != null ? `/${block.id}` : ''}`
    const utm = `?utm_source=ns-qr-code&utm_campaign=${shortLinkId}`

    return `${base}/${path}${utm}`
  }

  async parseAndVerifyTo(
    qrCode: QrCode,
    to: string
  ): Promise<{ toJourneyId: string; toBlockId?: string | null | undefined }> {
    const { origin, hostname, pathname } = new URL(to)

    const pathArray = pathname.split('/')
    const journeySlug = pathArray[1]
    const blockId = pathArray[2]

    if (hostname == null || journeySlug == null) {
      throw new GraphQLError('Invalid to', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    const customDomain = (
      await prisma.customDomain.findMany({
        where: { teamId: qrCode.teamId }
      })
    )[0]
    if (
      customDomain != null &&
      customDomain.name != null &&
      customDomain.name !== hostname
    ) {
      throw new GraphQLError('Invalid hostname', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    } else if (origin !== process.env.JOURNEYS_URL) {
      throw new GraphQLError('Invalid hostname', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    const journey = await prisma.journey.findFirstOrThrow({
      where: { slug: journeySlug }
    })

    const block =
      blockId != null
        ? await prisma.block.findFirstOrThrow({
            where: { journeyId: journey.id, id: blockId }
          })
        : undefined

    return {
      toJourneyId: journey.id,
      toBlockId: block?.id ?? undefined
    }
  }

  async updateJourneyShortLink(journeyId: string, newSlug: string) {
    const qrCodes = await prisma.qrCode.findMany({
      where: { journeyId, toJourneyId: journeyId }
    })

    for (const qrCode of qrCodes) {
      const to = await this.getTo({
        shortLinkId: qrCode.shortLinkId,
        teamId: qrCode.teamId,
        toJourneyId: qrCode.toJourneyId,
        toBlockId: qrCode.toBlockId ?? undefined,
        newJourneySlug: newSlug
      })
      await this.updateShortLink({
        id: qrCode.shortLinkId,
        to
      })
    }
  }

  async updateTeamShortLinks(teamId: string, customDomainName: string) {
    const qrCodes = await prisma.qrCode.findMany({
      where: { teamId }
    })

    for (const qrCode of qrCodes) {
      if (qrCode.journeyId === qrCode.toJourneyId) {
        const to = await this.getTo({
          shortLinkId: qrCode.shortLinkId,
          teamId: qrCode.teamId,
          toJourneyId: qrCode.toJourneyId,
          toBlockId: qrCode.toBlockId ?? undefined,
          newCustomDomain: customDomainName
        })
        await this.updateShortLink({
          id: qrCode.shortLinkId,
          to
        })
      }
    }
  }
}
