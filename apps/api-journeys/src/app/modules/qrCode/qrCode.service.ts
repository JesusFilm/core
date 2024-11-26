import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { Injectable } from '@nestjs/common'
import { graphql } from 'gql.tada'

import { ShortLink } from '.prisma/api-media-client'

import {
  MutationShortLinkCreateInput,
  MutationShortLinkCreateSuccess,
  MutationShortLinkUpdateInput,
  MutationShortLinkUpdateSuccess
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

const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
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

  async getTo(
    qrCodeId: string,
    teamId: string,
    toJourneyId: string,
    toBlockId?: string | undefined | null
  ): Promise<string> {
    const journey = await this.prismaService.journey.findUniqueOrThrow({
      where: { id: toJourneyId }
    })
    const customDomain = await this.prismaService.customDomain.findMany({
      where: { teamId }
    })[0]

    const base =
      customDomain?.name != null
        ? `https://${customDomain.name}`
        : process.env.JOURNEYS_URL
    const path = `${journey.slug}${toBlockId != null ? `/${toBlockId}` : ''}`
    const utm = `?utm_source=ns-qr-code&utm_campaign=${qrCodeId}`

    return `${base}/${path}${utm}`
  }

  async getShortLink(id: string): Promise<ShortLink> {
    const {
      data: { shortLink }
    } = await apollo.query({
      query: GET_SHORT_LINK,
      variables: { id }
    })

    if (shortLink.__typename === 'NotFoundError') {
      throw new Error(shortLink.message)
    } else if (shortLink.__typename === 'QueryShortLinkSuccess') {
      return shortLink.data
    } else {
      throw new Error('Unexpected error occurred in short link query')
    }
  }

  async createShortLink(
    input: MutationShortLinkCreateInput
  ): Promise<MutationShortLinkCreateSuccess> {
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
      throw new Error(shortLinkCreate.message)
    } else if (
      shortLinkCreate.__typename === 'MutationShortLinkCreateSuccess'
    ) {
      return shortLinkCreate
    } else {
      throw new Error('Unexpected error occurred in short link creation')
    }
  }

  async updateShortLink(
    input: MutationShortLinkUpdateInput
  ): Promise<MutationShortLinkUpdateSuccess> {
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
      throw new Error(shortLinkUpdate.message)
    } else if (
      shortLinkUpdate.__typename === 'MutationShortLinkUpdateSuccess'
    ) {
      return shortLinkUpdate
    } else {
      throw new Error('Unexpected error occurred in short link update')
    }
  }

  async deleteShortLink(id: string): Promise<void> {
    const {
      data: { shortLinkDelete }
    } = await apollo.mutate({
      mutation: DELETE_SHORT_LINK,
      variables: {
        id
      }
    })

    if (shortLinkDelete.__typename === 'NotFoundError') {
      throw new Error(shortLinkDelete.message)
    } else if (
      shortLinkDelete.__typename !== 'MutationShortLinkDeleteSuccess'
    ) {
      throw new Error('Unexpected error occurred in short link deletion')
    }
  }

  async updateTeamShortLinks(teamId: string): Promise<void> {
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
    } catch (e) {
      throw new Error('Error updating team short links')
    }
  }

  async updateJourneyShortLink(toJourneyId: string): Promise<void> {
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
    } catch (e) {
      throw new Error('Error updating short link')
    }
  }
}
