// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { IdAsKey } from '@core/nest/decorators'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import {
  SignUpResponse,
  SignUpResponseCreateInput
} from '../../../__generated__/graphql'
import { ResponseService } from '../response.service'

@Resolver('SignUpResponse')
export class SignUpResponseResolver {
  constructor(private readonly responseService: ResponseService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()
  async signUpResponseCreate(
    @Args('input') input: SignUpResponseCreateInput & { __typename }
  ): Promise<SignUpResponse> {
    input.__typename = 'SignUpResponse'
    return await this.responseService.save(input)
  }
}
