// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators'
import {
  ButtonClickEvent,
  ButtonClickEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('StepViewEvent')
export class ButtonClickEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async buttonClickEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ButtonClickEventCreateInput & { __typename }
  ): Promise<ButtonClickEvent> {
    input.__typename = 'ButtonClickEvent'
    return await this.eventService.save({ ...input, userId })
  }
}
