import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { KeyAsId } from '@core/nest/decorators'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  Action,
  NavigateToBlockActionInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'

@Resolver('NavigateToBlockActionResolver')
export class NavigateToBlockActionResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async blockUpdateNavigateToBlockAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: NavigateToBlockActionInput
  ): Promise<Action> {
    return await this.blockService.update(id, {
      action: { ...input, journeyId: null, url: null, target: null }
    })
  }
}
