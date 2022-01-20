import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { IdAsKey } from '@core/nest/decorators'
import {
  SignUpBlock,
  SignUpBlockCreateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('SignUpBlock')
export class SignUpBlockResolvers {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  @IdAsKey()
  async signUpBlockCreate(
    @Args('input') input: SignUpBlockCreateInput & { __typename }
  ): Promise<SignUpBlock> {
    input.__typename = 'SignUpBlock'
    return await this.blockService.save(input)
  }
}
