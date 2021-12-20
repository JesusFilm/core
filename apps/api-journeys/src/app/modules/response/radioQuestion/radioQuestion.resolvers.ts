// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { RadioQuestionResponse, RadioQuestionResponseCreateInput } from '../../../__generated__/graphql'
import { IdAsKey } from '@core/nest/decorators'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { ResponseService } from '../response.service'

@Resolver('Response')
export class RadioQuestionResponseResolver {
  constructor(private readonly responseService: ResponseService) { }
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()  
  async radioQuestionResponseCreate(
    @Args('input') input: RadioQuestionResponseCreateInput
  ): Promise<RadioQuestionResponse> {
    input.type = 'RadioQuestionResponse'
    return await this.responseService.save(input)
  }
}
