import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { Injectable } from '@nestjs/common'
import { graphql } from 'gql.tada'
import { GraphQLError } from 'graphql'

import { QrCode } from '.prisma/api-journeys-client'

import {
  MutationShortLinkCreateInput,
  MutationShortLinkCreateSuccess,
  MutationShortLinkDeleteSuccess,
  MutationShortLinkUpdateInput,
  MutationShortLinkUpdateSuccess,
  ShortLink
} from '../../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

const httpLink = createHttpLink({
  uri: process.env.GATEWAY_URL,
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? '',
    'x-graphql-client-name': 'api-journeys',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

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
  mutation shortLinkCreate($input: MutationShortLinkCreateInput!) {
    shortLinkCreate(input: $input) {
      ... on ZodError {
        message
      }
      ... on NotUniqueError {
        message
      }
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
    }
  }
`)

export const UPDATE_SHORT_LINK = graphql(`
  mutation shortLinkUpdate($input: MutationShortLinkUpdateInput!) {
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

export const DELETE_SHORT_LINK = graphql(`
  mutation shortLinkDelete($id: String!) {
    shortLinkDelete(id: $id) {
      ... on NotFoundError {
        message
      }
      ... on MutationShortLinkDeleteSuccess {
        data {
          id
        }
      }
    }
  }
`)

@Injectable()
export class QrCodeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getShortLink(id: string): Promise<ShortLink> {
    const apollo = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    })

    const {
      data: { shortLink }
    } = await apollo.query({
      query: GET_SHORT_LINK,
      variables: { id }
    })

    if (shortLink.__typename === 'NotFoundError') {
      throw new GraphQLError(shortLink.message, {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    } else if (shortLink.__typename === 'QueryShortLinkSuccess') {
      return shortLink.data
    } else {
      throw new GraphQLError('Unexpected error occurred in short link query', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  }

  async createShortLink(
    input: MutationShortLinkCreateInput
  ): Promise<MutationShortLinkCreateSuccess> {
    const apollo = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    })

    const {
      data: { shortLinkCreate }
    } = await apollo.mutate({
      mutation: CREATE_SHORT_LINK,
      variables: {
        input
      }
    })

    if (
      shortLinkCreate.__typename === 'ZodError' ||
      shortLinkCreate.__typename === 'NotUniqueError'
    ) {
      throw new GraphQLError(shortLinkCreate.message, {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    } else if (
      shortLinkCreate.__typename === 'MutationShortLinkCreateSuccess'
    ) {
      return shortLinkCreate
    } else {
      throw new GraphQLError(
        'Unexpected error occurred in short link creation',
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        }
      )
    }
  }

  async updateShortLink(
    input: MutationShortLinkUpdateInput
  ): Promise<MutationShortLinkUpdateSuccess> {
    const apollo = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    })

    const {
      data: { shortLinkUpdate }
    } = await apollo.mutate({
      mutation: UPDATE_SHORT_LINK,
      variables: {
        input
      }
    })

    if (
      shortLinkUpdate.__typename === 'ZodError' ||
      shortLinkUpdate.__typename === 'NotFoundError'
    ) {
      throw new GraphQLError(shortLinkUpdate.message, {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    } else if (
      shortLinkUpdate.__typename === 'MutationShortLinkUpdateSuccess'
    ) {
      return shortLinkUpdate
    } else {
      throw new GraphQLError('Unexpected error occurred in short link update', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  }

  async deleteShortLink(id: string): Promise<MutationShortLinkDeleteSuccess> {
    const apollo = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    })

    const {
      data: { shortLinkDelete }
    } = await apollo.mutate({
      mutation: DELETE_SHORT_LINK,
      variables: {
        id
      }
    })

    if (shortLinkDelete.__typename === 'NotFoundError') {
      throw new GraphQLError(shortLinkDelete.message, {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    } else if (
      shortLinkDelete.__typename === 'MutationShortLinkDeleteSuccess'
    ) {
      return shortLinkDelete
    } else {
      throw new GraphQLError(
        'Unexpected error occurred in short link deletion',
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        }
      )
    }
  }

  async getTo(
    qrCodeId: string,
    teamId: string,
    toJourneyId: string,
    toBlockId?: string | undefined | null
  ): Promise<string> {
    const journey = await this.prismaService.journey.findUniqueOrThrow({
      where: { id: toJourneyId }
    })
    const customDomain = (
      await this.prismaService.customDomain.findMany({
        where: { teamId }
      })
    )[0]
    const block =
      toBlockId != null
        ? await this.prismaService.block.findUniqueOrThrow({
            where: { journeyId: journey.id, id: toBlockId }
          })
        : null

    const base =
      customDomain?.name != null
        ? `https://${customDomain.name}`
        : process.env.JOURNEYS_URL
    const path = `${journey.slug}${block != null ? `/${block.id}` : ''}`
    const utm = `?utm_source=ns-qr-code&utm_campaign=${qrCodeId}`

    return `${base}/${path}${utm}`
  }

  async updateTeamShortLinks(teamId: string): Promise<void> {
    const apollo = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    })

    const qrCodes = await this.prismaService.qrCode.findMany({
      where: { teamId }
    })

    try {
      qrCodes.forEach(async (qrCode) => {
        const to = await this.getTo(
          qrCode.id,
          qrCode.teamId,
          qrCode.toJourneyId,
          qrCode.toBlockId
        )

        await apollo.mutate({
          mutation: UPDATE_SHORT_LINK,
          variables: {
            input: { id: qrCode.shortLinkId, to }
          }
        })
      })
    } catch (error) {
      throw new GraphQLError(error.message)
    }
  }

  async updateJourneyShortLink(toJourneyId: string): Promise<void> {
    const apollo = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    })

    const qrCode = await this.prismaService.qrCode.findFirstOrThrow({
      where: { toJourneyId }
    })

    const to = await this.getTo(
      qrCode.id,
      qrCode.teamId,
      qrCode.toJourneyId,
      qrCode.toBlockId
    )

    try {
      await apollo.mutate({
        mutation: UPDATE_SHORT_LINK,
        variables: {
          input: { id: qrCode.shortLinkId, to }
        }
      })
    } catch (error) {
      throw new GraphQLError(error.message)
    }
  }

  async parseAndVerifyTo(
    qrCode: QrCode,
    to: string
  ): Promise<{ toJourneyId: string; toBlockId?: string | null | undefined }> {
    const { origin, hostname, pathname } = new URL(to)

    const pathArray = pathname.split('/')
    const journeySlug = pathArray[1]
    const blockId = pathArray[2]

    if (hostname == null || journeySlug == null)
      throw new GraphQLError('Invalid to', {
        extensions: { code: 'BAD_USER_INPUT' }
      })

    const customDomain = (
      await this.prismaService.customDomain.findMany({
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

    const journey = await this.prismaService.journey.findFirstOrThrow({
      where: { slug: journeySlug }
    })

    const block =
      blockId != null
        ? await this.prismaService.block.findFirstOrThrow({
            where: { journeyId: journey.id, id: blockId }
          })
        : undefined

    return {
      toJourneyId: journey.id,
      toBlockId: block?.id ?? undefined
    }
  }
}
