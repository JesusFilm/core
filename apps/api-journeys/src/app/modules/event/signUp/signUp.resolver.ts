// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import {
  SignUpResponse,
  SignUpResponseCreateInput
} from '../../../__generated__/graphql' // change
import { EventService } from '../event.service'

@Resolver('SignUpResponse')
export class SignUpResponseResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async signUpResponseCreate(
    @Args('input') input: SignUpResponseCreateInput & { __typename }
  ): Promise<SignUpResponse> {
    input.__typename = 'SignUpEvent'
    return await this.eventService.save(input)
  }
}
