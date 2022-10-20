// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  ButtonClickEvent,
  ButtonClickEventCreateInput,
  ButtonBlock
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('ButtonClickEvent')
export class ButtonClickEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async buttonClickEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ButtonClickEventCreateInput
  ): Promise<ButtonClickEvent> {
    const block = (await this.eventService.getBlockById(
      input.blockId
    )) as ButtonBlock
    const journeyId = block.journeyId
    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'
    const buttonLabel: string = block.label

    return await this.eventService.save({
      ...input,
      __typename: 'ButtonClickEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      buttonLabel,
      teamId: 'team.id' // TODO: update
    })
  }
}
