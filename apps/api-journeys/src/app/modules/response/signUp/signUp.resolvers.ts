// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { SignUpResponse, SignUpResponseCreateInput } from '../../../graphql'
import { IdAsKey } from '../../../lib/decorators'
import { AuthGuard } from '../../../lib/auth/auth.guard'
import { ResponseService } from '../response.service'

@Resolver('Response')
export class SignUpResponseResolver {
  constructor(private readonly responseservice: ResponseService) { }
  @Mutation()
  @IdAsKey()
  @UseGuards(new AuthGuard())
  async signUpResponseCreate(
    @Args('input') input: SignUpResponseCreateInput,      
  ): Promise<SignUpResponse> {
    input.type = 'SignUpResponse'
    return await this.responseservice.save(input)
  }
}
