// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators'
import { StepEvent, StepEventCreateInput } from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('StepEvent')
export class StepEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepEventCreateInput & { __typename }
  ): Promise<StepEvent> {
    input.__typename = 'StepEvent'
    return await this.eventService.save({ ...input, userId })
  }
}
