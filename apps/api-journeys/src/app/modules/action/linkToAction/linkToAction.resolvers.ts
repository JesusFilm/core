import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { KeyAsId } from '@core/nest/decorators'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  Action,
  LinkActionInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'

@Resolver('LinkToAction')
export class LinkToActionResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async blockUpdateLinkAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: LinkActionInput
  ): Promise<Action> {
    return await this.blockService.update(id, {
      action: { ...input, blockId: null, journeyId: null }
    })
  }
}
