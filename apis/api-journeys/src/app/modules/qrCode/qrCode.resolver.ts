import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'
import { v4 as uuidv4 } from 'uuid'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { Prisma, QrCode } from '@core/prisma/journeys/client'

import { Service } from '../../../__generated__/graphql'
import {
  QrCodeCreateInput,
  QrCodeUpdateInput,
  QrCodesFilter
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { INCLUDE_QR_CODE_ACL } from './qrCode.acl'
import { QrCodeService } from './qrCode.service'

@Resolver('QrCode')
export class QrCodeResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly qrCodeService: QrCodeService
  ) {}

  async getQrCode(@Args('id') id: string): Promise<QrCode> {
    return await this.prismaService.qrCode.findUniqueOrThrow({
      where: { id },
      include: {
        ...INCLUDE_QR_CODE_ACL
      }
    })
  }

  @Query()
  async qrCode(@Args('id') id: string): Promise<QrCode> {
    return await this.getQrCode(id)
  }

  @Query()
  async qrCodes(@Args('where') where: QrCodesFilter): Promise<QrCode[]> {
    const filter: Prisma.QrCodeWhereInput = {}
    if (where.journeyId) filter.journeyId = where.journeyId
    if (where.teamId) filter.teamId = where.teamId
    return await this.prismaService.qrCode.findMany({ where: filter })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async qrCodeCreate(
    @Args('input') input: QrCodeCreateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<QrCode> {
    const shortLinkId = uuidv4()
    const to = await this.qrCodeService.getTo({
      shortLinkId,
      teamId: input.teamId,
      toJourneyId: input.journeyId
    })

    return await this.prismaService.$transaction(async (tx) => {
      if (process.env.JOURNEYS_SHORTLINK_DOMAIN == null)
        throw new GraphQLError('Shortlink domain not added', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })

      const shortLinkCreate = await this.qrCodeService.createShortLink({
        id: shortLinkId,
        hostname: process.env.JOURNEYS_SHORTLINK_DOMAIN,
        to,
        service: Service.ApiJourneys
      })

      const qrCode = await tx.qrCode.create({
        data: {
          ...input,
          toJourneyId: input.journeyId,
          shortLinkId: shortLinkCreate.data.id
        },
        include: {
          ...INCLUDE_QR_CODE_ACL
        }
      })

      if (ability.cannot(Action.Manage, subject('QrCode', qrCode))) {
        throw new GraphQLError('User is not allowed to create the QrCode', {
          extensions: { code: 'FORBIDDEN' }
        })
      }
      return qrCode
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async qrCodeUpdate(
    @Args('id') id: string,
    @Args('input') input: QrCodeUpdateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<QrCode> {
    const qrCode = await this.getQrCode(id)
    const updateInput = {
      ...omit(input, 'to'),
      toJourneyId: qrCode.toJourneyId,
      toBlockId: qrCode.toBlockId
    }

    return await this.prismaService.$transaction(async (tx) => {
      if (input.to != null) {
        const { toJourneyId, toBlockId } =
          await this.qrCodeService.parseAndVerifyTo(qrCode, input.to)
        const to = await this.qrCodeService.getTo({
          shortLinkId: qrCode.shortLinkId,
          teamId: qrCode.teamId,
          toJourneyId: toJourneyId ?? qrCode.toJourneyId,
          toBlockId: toBlockId
        })
        await this.qrCodeService.updateShortLink({
          id: qrCode.shortLinkId,
          to
        })

        if (toJourneyId != null) updateInput.toJourneyId = toJourneyId
        if (toBlockId != null) updateInput.toBlockId = toBlockId
      }

      if (ability.cannot(Action.Manage, subject('QrCode', qrCode))) {
        throw new GraphQLError('User is not allowed to update the QrCode', {
          extensions: { code: 'FORBIDDEN' }
        })
      }
      return await tx.qrCode.update({
        where: { id },
        data: updateInput
      })
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async qrCodeDelete(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<QrCode> {
    const qrCode = await this.getQrCode(id)
    if (ability.cannot(Action.Manage, subject('QrCode', qrCode))) {
      throw new GraphQLError('User is not allowed to delete the QrCode', {
        extensions: { code: 'FORBIDDEN' }
      })
    }
    return await this.prismaService.$transaction(async (tx) => {
      await this.qrCodeService.deleteShortLink(qrCode.shortLinkId)
      return await tx.qrCode.delete({ where: { id } })
    })
  }

  @ResolveField()
  async shortLink(@Parent() qrCode: QrCode): Promise<{
    __typename: 'ShortLink'
    id: string
  }> {
    return { __typename: 'ShortLink', id: qrCode.shortLinkId }
  }
}
