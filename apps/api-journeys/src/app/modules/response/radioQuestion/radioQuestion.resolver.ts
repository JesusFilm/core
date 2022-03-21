// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import {
  RadioQuestionResponse,
  RadioQuestionResponseCreateInput
} from '../../../__generated__/graphql'
import { ResponseService } from '../response.service'

@Resolver('RadioQuestionResponse')
export class RadioQuestionResponseResolver {
  constructor(private readonly responseService: ResponseService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async radioQuestionResponseCreate(
    @Args('input') input: RadioQuestionResponseCreateInput & { __typename }
  ): Promise<RadioQuestionResponse> {
    input.__typename = 'RadioQuestionResponse'
    return await this.responseService.save(input)
  }
}
