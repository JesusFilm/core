// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import {
  RadioQuestionEvent,
  RadioQuestionEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('RadioQuestionEvent')
export class RadioQuestionEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async radioQuestionEventCreate(
    @Args('input') input: RadioQuestionEventCreateInput & { __typename }
  ): Promise<RadioQuestionEvent> {
    input.__typename = 'RadioQuestionEvent'
    return await this.eventService.save(input)
  }
}
