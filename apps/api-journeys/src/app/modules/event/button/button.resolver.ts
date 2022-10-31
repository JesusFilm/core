// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  ButtonClickEvent,
  ButtonClickEventCreateInput,
  ChatOpenedEventCreateInput,
  ChatOpenedEvent
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'

@Resolver('ButtonClickEvent')
export class ButtonClickEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async buttonClickEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ButtonClickEventCreateInput
  ): Promise<ButtonClickEvent> {
    const block: { journeyId: string } = await this.blockService.get(
      input.blockId
    )

    const journeyId = block.journeyId

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'ButtonClickEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId
    })
  }
}

@Resolver('ChatOpenedEvent')
export class ChatOpenedEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async chatOpenedEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ChatOpenedEventCreateInput
  ): Promise<ChatOpenedEvent> {
    const block: {
      journeyId: string
      parentBlockId: string
      label: string
      action: { url: string }
    } = await this.blockService.get(input.blockId)

    const journeyId = block.journeyId

    const stepBlock = await this.eventService.getParentStepBlockByBlockId(
      input.blockId
    )

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    const network = messageNetworks.find(({ link }) =>
      block.action.url.includes(link)
    )

    return await this.eventService.save({
      ...input,
      __typename: 'ChatOpenedEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: stepBlock?.id,
      label: null,
      value: network?.platform
    })
  }
}

const messageNetworks = [
  {
    link: 'm.me',
    platform: 'Facebook'
  },
  {
    link: 'fb.me',
    platform: 'Facebook'
  },
  {
    link: 't.me',
    platform: 'Telegram'
  },
  {
    link: 'wa.me',
    platform: 'WhatsApp'
  },
  {
    link: 'whatsapp',
    platform: 'WhatsApp'
  },
  {
    link: 'api.whatsapp.com',
    platform: 'WhatsApp'
  },
  {
    link: 'instagram.com',
    platform: 'Instagram'
  },
  {
    link: 'viber',
    platform: 'Viber'
  },
  {
    link: 'vk.com',
    platform: 'VK'
  },
  {
    link: 'snapchat.com',
    platform: 'SnapChat'
  },
  {
    link: 'skype',
    platform: 'Skype'
  },
  {
    link: 'line',
    platform: 'Line'
  },
  {
    link: 'tiktok.com/@',
    platform: 'TikTok'
  }
]
