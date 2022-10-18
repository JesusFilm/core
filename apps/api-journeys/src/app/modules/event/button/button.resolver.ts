// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CurrentUserInfo } from '@core/nest/decorators/CurrentUserInfo'
import {
  ButtonClickEvent,
  ButtonClickEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('ButtonClickEvent')
export class ButtonClickEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async buttonClickEventCreate(
    @CurrentUserId() userId: string,
    @CurrentUserInfo() info,
    @Args('input') input: ButtonClickEventCreateInput
  ): Promise<ButtonClickEvent> {
    return await this.eventService.save({
      ...input,
      __typename: 'ButtonClickEvent',
      userId,
      createdAt: new Date().toISOString(),
      info
    })
  }
}
