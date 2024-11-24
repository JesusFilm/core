import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { graphql } from 'gql.tada'
import { v4 as uuidv4 } from 'uuid'

import { Block, Prisma, QrCode } from '.prisma/api-journeys-client'
import { ShortLink } from '.prisma/api-media-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import {
  MutationShortLinkCreateResult,
  MutationShortLinkDeleteResult,
  MutationShortLinkUpdateResult
} from '../../../__generated__/graphql'
import {
  QrCodeCreateInput,
  QrCodeUpdateInput,
  QrCodesFilter
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
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

const GET_SHORT_LINK = graphql(`
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

const CREATE_SHORT_LINK = graphql(`
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

const UPDATE_SHORT_LINK = graphql(`
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

const DELETE_SHORT_LINK = graphql(`
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

@Resolver('QrCode')
export class QrCodeResolver {
  constructor(private readonly prismaService: PrismaService) {}
  async getQrCode(@Args('id') id: string): Promise<QrCode> {
    const qrCode = await this.prismaService.qrCode.findUnique({
      where: { id }
    })
    if (qrCode == null) throw new Error('QrCode not found')
    return qrCode
  }
  async handleShortLinkResponse(
    handleSuccess: () => Promise<QrCode>,
    response?:
      | MutationShortLinkCreateResult
      | MutationShortLinkUpdateResult
      | MutationShortLinkDeleteResult
  ): Promise<QrCode> {
    if (response == null) return await handleSuccess()
    switch (response.__typename) {
      case 'ZodError':
      case 'NotUniqueError':
      case 'NotFoundError':
        throw new Error(response.message as string)
      case 'MutationShortLinkCreateSuccess':
      case 'MutationShortLinkUpdateSuccess':
      case 'MutationShortLinkDeleteSuccess':
        return await handleSuccess()
      default:
        throw new Error('Unexpected error occurred in short link mutation')
    }
  }
  async getTo(
    @Args('qrCodeId') qrCodeId: string,
    @Args('teamId') teamId: string,
    @Args('toJourneyId') toJourneyId: string,
    @Args('toBlockId') toBlockId: string | undefined | null
  ): Promise<string> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id: toJourneyId }
    })
    if (journey == null) throw new Error('Journey not found')
    const customDomain = await this.prismaService.customDomain.findMany({
      where: { teamId }
    })[0]
    const deployment = 'http://localhost:4100' // TODO - replace with ENV
    const base =
      customDomain?.name != null ? `https://${customDomain.name}` : deployment
    const path = `${journey.slug}${toBlockId != null ? `/${toBlockId}` : ''}`
    const utm = `?utm_source=ns-qr-code&utm_campaign=${qrCodeId}`
    return `${base}/${path}${utm}`
  }
  @Query()
  async qrCode(@Args('id') id: string): Promise<QrCode> {
    return await this.getQrCode(id)
  }
  @Query()
  async qrCodes(@Args('where') where?: QrCodesFilter): Promise<QrCode[]> {
    const filter: Prisma.QrCodeWhereInput = {}
    if (where?.journeyId) filter.journeyId = where.journeyId
    if (where?.teamId) filter.teamId = where.teamId
    return await this.prismaService.qrCode.findMany({ where: filter })
  }
  @Mutation()
  @UseGuards(AppCaslGuard)
  async qrCodeCreate(
    @Args('input') input: QrCodeCreateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<QrCode> {
    const id = uuidv4()
    const to = this.getTo(id, input.teamId, input.journeyId, input.toBlockId)
    if (ability.cannot(Action.Manage, 'QrCode')) {
      throw new Error('User is not allowed to create the QrCode')
    }
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const {
          data: { shortLinkCreate }
        } = await apollo.mutate({
          mutation: CREATE_SHORT_LINK,
          variables: {
            input: { hostname: 'localhost', to, service: 'apiJourneys' }
          }
        })
        return await this.handleShortLinkResponse(
          async () =>
            await tx.qrCode.create({
              data: {
                ...input,
                id,
                toJourneyId: input.journeyId,
                shortLinkId: shortLinkCreate.data.id
              }
            }),
          shortLinkCreate
        )
      })
    } catch (error) {
      throw error.message
    }
  }
  @Mutation()
  @UseGuards(AppCaslGuard)
  async qrCodeUpdate(
    @Args('id') id: string,
    @Args('input') input: QrCodeUpdateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<QrCode> {
    if (ability.cannot(Action.Manage, 'QrCode')) {
      throw new Error('User is not allowed to update the QrCode')
    }
    const qrCode = await this.getQrCode(id)
    return await this.prismaService.$transaction(async (tx) => {
      let response = undefined
      if (input.toJourneyId != null || input.toBlockId != null) {
        const to = this.getTo(
          id,
          qrCode.teamId,
          input.toJourneyId ?? qrCode.toJourneyId,
          input.toBlockId
        )
        const {
          data: { shortLinkUpdate }
        } = await apollo.mutate({
          mutation: UPDATE_SHORT_LINK,
          variables: {
            input: { id: qrCode.shortLinkId, to }
          }
        })
        response = shortLinkUpdate
      }
      return await this.handleShortLinkResponse(
        async () =>
          await tx.qrCode.update({
            where: { id },
            data: {
              ...input,
              qrCodeImageBlockId:
                input.qrCodeImageBlockId ?? qrCode.qrCodeImageBlockId,
              toJourneyId: input.toJourneyId ?? qrCode.toJourneyId
            }
          }),
        response
      )
    })
  }
  @Mutation()
  @UseGuards(AppCaslGuard)
  async qrCodeDelete(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<QrCode> {
    if (ability.cannot(Action.Manage, 'QrCode')) {
      throw new Error('User is not allowed to create the QrCode')
    }
    const qrCode = await this.getQrCode(id)
    return await this.prismaService.$transaction(async (tx) => {
      const {
        data: { shortLinkDelete }
      } = await apollo.mutate({
        mutation: DELETE_SHORT_LINK,
        variables: {
          id: qrCode.shortLinkId
        }
      })
      return await this.handleShortLinkResponse(async () => {
        if (qrCode.qrCodeImageBlockId != null) {
          await tx.block.delete({
            where: { id: qrCode.qrCodeImageBlockId }
          })
        }
        return await tx.qrCode.delete({ where: { id } })
      }, shortLinkDelete)
    })
  }
  @ResolveField()
  async qrCodeImageBlock(@Parent() qrCode: QrCode): Promise<Block | null> {
    if (qrCode.qrCodeImageBlockId == null) return null
    const block = await this.prismaService.block.findUnique({
      where: { id: qrCode.qrCodeImageBlockId },
      include: { action: true }
    })
    // if (block?.journeyId !== qrCode.id) return null
    return block
  }
  @ResolveField()
  async shortLink(@Parent() qrCode: QrCode): Promise<ShortLink> {
    const {
      data: { shortLink }
    } = await apollo.query({
      query: GET_SHORT_LINK,
      variables: { id: qrCode.shortLinkId }
    })
    switch (shortLink.__typename) {
      case 'NotFoundError':
        throw new Error(shortLink.message)
      case 'QueryShortLinkSuccess':
        return shortLink.data
      default:
        throw new Error('Unexpected error occurred in short link query')
    }
  }
}
