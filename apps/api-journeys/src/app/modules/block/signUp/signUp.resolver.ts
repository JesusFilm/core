import { UserInputError } from 'apollo-server-errors'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver, ResolveField, Parent } from '@nestjs/graphql'
import { IdAsKey, KeyAsId } from '@core/nest/decorators'
import {
  Action,
  SignUpBlock,
  SignUpBlockCreateInput,
  SignUpBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('SignUpBlock')
export class SignUpBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @ResolveField()
  action(@Parent() block: SignUpBlock): Action | null {
    if (block.action == null) return null

    return {
      ...block.action,
      parentBlockId: block.id
    }
  }

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
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...input,
      parentOrder: siblings.length
    })
  }

  @Mutation()
  @KeyAsId()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async signUpBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: SignUpBlockUpdateInput
  ): Promise<SignUpBlock> {
    if (input.submitIconId != null) {
      const submitIcon = await this.blockService.validateBlock(
        input.submitIconId,
        id
      )
      if (!submitIcon) {
        throw new UserInputError('Submit icon does not exist')
      }
    }

    return await this.blockService.update(id, input)
  }
}
