import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { v4 as uuidv4 } from 'uuid'

import { Block, Prisma, QrCode } from '.prisma/api-journeys-client'
import { ShortLink } from '.prisma/api-media-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import { Service } from '../../../__generated__/graphql'
import {
  QrCodeCreateInput,
  QrCodeUpdateInput,
  QrCodesFilter
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { QrCodeService } from './qrCode.service'

@Resolver('QrCode')
export class QrCodeResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly qrCodeService: QrCodeService
  ) {}

  async getQrCode(@Args('id') id: string): Promise<QrCode> {
    return await this.prismaService.qrCode.findUniqueOrThrow({
      where: { id }
    })
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
    if (ability.cannot(Action.Manage, 'QrCode')) {
      throw new Error('User is not allowed to create the QrCode')
    }
    const id = uuidv4()
    const to = await this.qrCodeService.getTo(
      id,
      input.teamId,
      input.journeyId,
      input.toBlockId
    )

    return await this.prismaService.$transaction(async (tx) => {
      const shortLinkCreate = await this.qrCodeService.createShortLink({
        hostname: 'localhost',
        to,
        service: Service.ApiJourneys
      })
      return await tx.qrCode.create({
        data: {
          ...input,
          id,
          toJourneyId: input.journeyId,
          shortLinkId: shortLinkCreate.data.id
        }
      })
    })
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
      if (input.toJourneyId != null || input.toBlockId != null) {
        const to = await this.qrCodeService.getTo(
          id,
          qrCode.teamId,
          input.toJourneyId ?? qrCode.toJourneyId,
          input.toBlockId
        )
        await this.qrCodeService.updateShortLink({
          id: qrCode.shortLinkId,
          to
        })
      }
      return await tx.qrCode.update({
        where: { id },
        data: {
          ...input,
          qrCodeImageBlockId:
            input.qrCodeImageBlockId ?? qrCode.qrCodeImageBlockId,
          toJourneyId: input.toJourneyId ?? qrCode.toJourneyId
        }
      })
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
      await this.qrCodeService.deleteShortLink(qrCode.shortLinkId)
      if (qrCode.qrCodeImageBlockId != null) {
        await tx.block.delete({
          where: { id: qrCode.qrCodeImageBlockId }
        })
      }
      return await tx.qrCode.delete({ where: { id } })
    })
  }

  @ResolveField()
  async qrCodeImageBlock(@Parent() qrCode: QrCode): Promise<Block | null> {
    if (qrCode.qrCodeImageBlockId == null) return null
    const block = await this.prismaService.block.findUnique({
      where: { id: qrCode.qrCodeImageBlockId },
      include: { action: true }
    })
    if (block?.journeyId !== qrCode.journeyId) return null
    return block
  }

  @ResolveField()
  async shortLink(@Parent() qrCode: QrCode): Promise<ShortLink> {
    return await this.qrCodeService.getShortLink(qrCode.shortLinkId)
  }
}
