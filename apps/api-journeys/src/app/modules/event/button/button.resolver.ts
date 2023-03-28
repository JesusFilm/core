// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  ButtonClickEvent,
  ButtonClickEventCreateInput,
  ChatOpenEventCreateInput,
  ChatOpenEvent,
  MessagePlatform,
  ButtonAction
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { VisitorService } from '../../visitor/visitor.service'

@Resolver('ButtonClickEvent')
export class ButtonClickEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async buttonClickEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ButtonClickEventCreateInput
  ): Promise<ButtonClickEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    const promiseArray = [
      this.eventService.save({
        ...input,
        __typename: 'ButtonClickEvent',
        visitorId: visitor.id,
        createdAt: new Date().toISOString(),
        journeyId
      })
    ]

    if (input.action === ButtonAction.LinkAction) {
      promiseArray.push(
        this.visitorService.update(visitor.id, {
          lastLinkAction: input.actionValue ?? undefined
        })
      )
    }

    const [buttonClickEvent] = await Promise.all([...promiseArray])
    return buttonClickEvent
  }
}

@Resolver('ChatOpenEvent')
export class ChatOpenEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async chatOpenEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ChatOpenEventCreateInput
  ): Promise<ChatOpenEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    const lastChatStartedAt = new Date().toISOString()
    const promiseArray = [
      this.eventService.save({
        ...input,
        __typename: 'ChatOpenEvent',
        visitorId: visitor.id,
        createdAt: new Date().toISOString(),
        journeyId
      }),
      this.visitorService.update(visitor.id, {
        lastChatStartedAt,
        lastChatPlatform: input.value ?? undefined,
        lastEventAt: lastChatStartedAt
      })
    ]
    if (visitor?.messagePlatform == null) {
      promiseArray.push(
        this.visitorService.update(visitor.id, {
          messagePlatform: input.value ?? undefined
        })
      )
    }

    const [ChatOpenEvent] = await Promise.all([...promiseArray])
    return ChatOpenEvent
  }

  @ResolveField('messagePlatform')
  messagePlatform(@Parent() event): MessagePlatform | undefined {
    return MessagePlatform[event.value]
  }
}
