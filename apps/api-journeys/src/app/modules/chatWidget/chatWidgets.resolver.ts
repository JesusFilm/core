import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { JourneyService } from '../journey/journey.service'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import {
  ChatWidget,
  ChatWidgetUpdateInput,
  Journey,
  Role,
  UserJourneyRole
} from '../../__generated__/graphql'

@Resolver('ChatWidgets')
export class ChatWidgetsResolver {
  constructor(private readonly journeyService: JourneyService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async chatWidgetsUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: ChatWidgetUpdateInput
  ): Promise<ChatWidget | null> {
    const chatWidget = input != null ? { ...input } : null

    if (chatWidget != null && id == null) {
      chatWidget.id = uuidv4()
    }

    const journey: Journey = await this.journeyService.get(journeyId)
    const chatWidgets = journey.chatWidgets ?? []

    const chatWidgetIndex = chatWidgets.findIndex(
      (widget) => widget?.id === chatWidget?.id
    )

    const updatedChatWidgets =
      input === null && id !== undefined
        ? chatWidgets.filter((widget) => widget?.id !== id)
        : chatWidgetIndex === -1
        ? [...chatWidgets, chatWidget]
        : chatWidgets.map((widget, index) =>
            index === chatWidgetIndex ? chatWidget : widget
          )

    await this.journeyService.update(journeyId, {
      chatWidgets: updatedChatWidgets
    })

    return chatWidget
  }
}
