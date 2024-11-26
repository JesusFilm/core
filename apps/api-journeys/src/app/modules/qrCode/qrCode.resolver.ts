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

import { Prisma, QrCode } from '.prisma/api-journeys-client'
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

  async decodeAndVerifyDestination(
    qrCode: QrCode,
    destination: string
  ): Promise<{ toJourneyId: string; toBlockId?: string | null | undefined }> {
    const { origin, hostname, pathname } = new URL(destination)

    const pathArray = pathname.split('/')
    const journeySlug = pathArray[0]
    const blockId = pathArray[1]

    if (hostname == null || journeySlug == null)
      throw new Error('Invalid destination')

    const customDomain = await this.prismaService.customDomain.findMany({
      where: { teamId: qrCode.teamId }
    })[0]
    if (
      customDomain != null &&
      customDomain.name != null &&
      customDomain.name !== hostname
    ) {
      throw new Error('Invalid hostname')
    } else if (origin !== process.env.JOURNEYS_URL) {
      throw new Error('Invalid hostname')
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
    const to = await this.qrCodeService.getTo(id, input.teamId, input.journeyId)

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
    const updateInput = {
      ...input,
      destination: qrCode.destination,
      toJourneyId: qrCode.toJourneyId,
      toBlockId: qrCode.toBlockId
    }

    return await this.prismaService.$transaction(async (tx) => {
      if (input.newDestination != null) {
        const { toJourneyId, toBlockId } =
          await this.decodeAndVerifyDestination(qrCode, input.newDestination)
        const to = await this.qrCodeService.getTo(
          id,
          qrCode.teamId,
          toJourneyId ?? qrCode.toJourneyId,
          toBlockId
        )
        await this.qrCodeService.updateShortLink({
          id: qrCode.shortLinkId,
          to
        })

        if (toJourneyId != null) updateInput.toJourneyId = toJourneyId
        if (toBlockId != null) updateInput.toBlockId = toBlockId
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
    if (ability.cannot(Action.Manage, 'QrCode')) {
      throw new Error('User is not allowed to create the QrCode')
    }
    const qrCode = await this.getQrCode(id)
    return await this.prismaService.$transaction(async (tx) => {
      await this.qrCodeService.deleteShortLink(qrCode.shortLinkId)
      return await tx.qrCode.delete({ where: { id } })
    })
  }

  @ResolveField()
  async shortLink(@Parent() qrCode: QrCode): Promise<ShortLink> {
    return await this.qrCodeService.getShortLink(qrCode.shortLinkId)
  }

  @ResolveField()
  async destination(@Parent() qrCode: QrCode): Promise<string> {
    const shortLink = await this.qrCodeService.getShortLink(qrCode.shortLinkId)
    return shortLink.to.split('?utm')[0]
  }
}
