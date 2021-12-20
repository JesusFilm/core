// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { SignUpResponse, SignUpResponseCreateInput } from '../../../__generated__/graphql'
import { IdAsKey } from '@core/nest/decorators'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { ResponseService } from '../response.service'

@Resolver('Response')
export class SignUpResponseResolver {
  constructor(private readonly responseService: ResponseService) { }
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()  
  async signUpResponseCreate(
    @Args('input') input: SignUpResponseCreateInput,      
  ): Promise<SignUpResponse> {
    input.type = 'SignUpResponse'
    return await this.responseService.save(input)
  }
}
