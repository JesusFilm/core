// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators'
import {
  StepResponse,
  StepResponseCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('StepResponse')
export class StepResponseResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepResponseCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepResponseCreateInput & { __typename }
  ): Promise<StepResponse> {
    input.__typename = 'StepEvent'
    return await this.eventService.save({ ...input, userId })
  }
}
