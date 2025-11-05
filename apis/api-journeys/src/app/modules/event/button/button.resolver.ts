// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import {
  ButtonAction,
  ButtonClickEvent,
  ButtonClickEventCreateInput,
  ChatOpenEvent,
  ChatOpenEventCreateInput,
  MessagePlatform
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

@Resolver('ButtonClickEvent')
export class ButtonClickEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async buttonClickEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ButtonClickEventCreateInput
  ): Promise<ButtonClickEvent> {
    const { visitor, journeyVisitor, journeyId } =
      await this.eventService.validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

    const promises = [
      this.eventService.save({
        ...input,
        id: input.id ?? undefined,
        typename: 'ButtonClickEvent',
        visitor: { connect: { id: visitor.id } },
        stepId: input.stepId ?? undefined,
        journey: { connect: { id: journeyId } }
      })
    ]

    if (input.action === ButtonAction.LinkAction) {
      promises.push(
        this.prismaService.visitor.update({
          where: { id: visitor.id },
          data: {
            lastLinkAction: input.actionValue ?? undefined
          }
        }),
        this.prismaService.journeyVisitor.update({
          where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
          data: {
            lastLinkAction: input.actionValue ?? undefined,
            activityCount: journeyVisitor.activityCount + 1
          }
        })
      )
    }

    if (input.action === ButtonAction.EmailAction) {
      promises.push(
        this.prismaService.journeyVisitor.update({
          where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
          data: {
            activityCount: journeyVisitor.activityCount + 1
          }
        })
      )
    }

    const [buttonClickEvent] = await Promise.all(promises)
    return buttonClickEvent as ButtonClickEvent
  }
}

@Resolver('ChatOpenEvent')
export class ChatOpenEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async chatOpenEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ChatOpenEventCreateInput
  ): Promise<ChatOpenEvent> {
    const { visitor, journeyId, journeyVisitor } =
      await this.eventService.validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

    const promises = [
      this.eventService.save({
        ...input,
        id: input.id ?? undefined,
        typename: 'ChatOpenEvent',
        visitor: { connect: { id: visitor.id } },
        stepId: input.stepId ?? undefined,
        journey: { connect: { id: journeyId } }
      })
    ]

    const data = {
      lastChatStartedAt: new Date(),
      lastChatPlatform: input.value ?? undefined
    }
    promises.push(
      this.prismaService.visitor.update({
        where: { id: visitor.id },
        data: {
          ...data,
          messagePlatform:
            visitor?.messagePlatform == null
              ? input.value
              : visitor.messagePlatform
        }
      })
    )
    promises.push(
      this.prismaService.journeyVisitor.update({
        where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
        data: {
          ...data,
          activityCount: journeyVisitor.activityCount + 1
        }
      })
    )

    await this.eventService.sendEventsEmail(journeyId, visitor.id)

    const [chatOpenEvent] = await Promise.all(promises)
    return chatOpenEvent as ChatOpenEvent
  }

  @ResolveField('messagePlatform')
  messagePlatform(@Parent() event): MessagePlatform | undefined {
    return MessagePlatform[event.value]
  }
}
