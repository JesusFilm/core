// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import {
  SignUpEvent,
  SignUpEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('SignUpEvent')
export class SignUpEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async signUpEventCreate(
    @Args('input') input: SignUpEventCreateInput & { __typename }
  ): Promise<SignUpEvent> {
    input.__typename = 'SignUpEvent'
    return await this.eventService.save(input)
  }
}
