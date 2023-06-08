import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { remove, findIndex, isEqual } from 'lodash'
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

  updateChatWidgets(chatWidgets, chatWidget, id): ChatWidget[] {
    const compareWidgetId = (widget): boolean =>
      isEqual(widget.id, chatWidget?.id ?? id)

    const existingWidgetIndex = findIndex(chatWidgets, compareWidgetId)

    if (chatWidget === null && id !== null) {
      return remove(chatWidgets, (widget) => !compareWidgetId(widget))
    }

    if (existingWidgetIndex === -1 && chatWidget !== null) {
      return [...chatWidgets, chatWidget]
    }

    return chatWidgets.map((widget, index) =>
      index === existingWidgetIndex && chatWidget !== null ? chatWidget : widget
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
    const journey: Journey = await this.journeyService.get(journeyId)
    let chatWidget: ChatWidget | null = null

    if (input !== null) {
      const existingChatWidget =
        journey.chatWidgets?.find((widget) => widget?.id === id) ?? null

      chatWidget = {
        ...existingChatWidget,
        ...input
      }
      chatWidget.id = id ?? uuidv4()
    }

    const updatedChatWidgets = this.updateChatWidgets(
      journey.chatWidgets ?? [],
      chatWidget,
      id
    )

    await this.journeyService.update(journeyId, {
      chatWidgets: updatedChatWidgets
    })

    return chatWidget
  }
}
