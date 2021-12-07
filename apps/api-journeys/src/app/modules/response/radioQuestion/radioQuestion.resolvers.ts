// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { RadioQuestionResponse, RadioQuestionResponseCreateInput } from '../../../graphql'
import { IdAsKey } from '../../../lib/decorators'
import { AuthGuard } from '../../../lib/auth/auth.guard'
import { ResponseService } from '../response.service'

@Resolver('Response')
export class RadioQuestionResponseResolver {
  constructor(private readonly responseservice: ResponseService) { }
  @Mutation()
  @IdAsKey()
  @UseGuards(new AuthGuard())
  async radioQuestionResponseCreate(
    @Args('input') input: RadioQuestionResponseCreateInput
  ): Promise<RadioQuestionResponse> {
    input.type = 'RadioQuestionResponse'
    return await this.responseservice.save(input)
  }
}
