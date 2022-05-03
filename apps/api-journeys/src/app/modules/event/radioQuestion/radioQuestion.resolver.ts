// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import {
  RadioQuestionResponse,
  RadioQuestionResponseCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('RadioQuestionResponse')
export class RadioQuestionResponseResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async radioQuestionResponseCreate(
    @Args('input') input: RadioQuestionResponseCreateInput & { __typename }
  ): Promise<RadioQuestionResponse> {
    input.__typename = 'RadioQuestionEvent'
    return await this.eventService.save(input)
  }
}
