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

  updateChatWidgets(chatWidgets, chatWidget, input, id): ChatWidget[] {
    if (input === null && id !== undefined) {
      return chatWidgets.filter((widget) => widget.id !== id)
    }

    const chatWidgetIndex = chatWidgets.findIndex(
      (widget) => widget.id === chatWidget.id
    )

    if (chatWidgetIndex === -1) {
      return [...chatWidgets, chatWidget]
    }

    return chatWidgets.map((widget, index) =>
      index === chatWidgetIndex ? chatWidget : widget
    )
  }

  @Mutation()
  @UseGuards(
    RoleGuard('id', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async chatWidgetsUpdate(
    @Args('id') id: string | null,
    @Args('journeyId') journeyId: string,
    @Args('input') input: ChatWidgetUpdateInput | null
  ): Promise<ChatWidget | null> {
    const chatWidget = input != null ? { ...input } : null

    if (chatWidget != null && id == null) {
      chatWidget.id = uuidv4()
    }

    const journey: Journey = await this.journeyService.get(journeyId)

    const updatedChatWidgets = this.updateChatWidgets(
      journey.chatWidgets ?? [],
      chatWidget,
      input,
      id
    )

    await this.journeyService.update(journeyId, {
      chatWidgets: updatedChatWidgets
    })

    return chatWidget
  }
}
