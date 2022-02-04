import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { KeyAsId } from '@core/nest/decorators'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  Action,
  Journey,
  NavigateToJourneyAction,
  NavigateToJourneyActionInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { BlockService } from '../../block/block.service'

@Resolver('NavigateToJourneyAction')
export class NavigateToJourneyActionResolver {
  constructor(
    private readonly journeyService: JourneyService,
    private readonly blockService: BlockService
  ) {}

  @ResolveField()
  @KeyAsId()
  async journey(@Parent() action: NavigateToJourneyAction): Promise<Journey> {
    return await this.journeyService.get(action.journeyId)
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async blockUpdateNavigateToJourneyAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: NavigateToJourneyActionInput
  ): Promise<Action> {
    return await this.blockService.update(id, {
      action: { ...input, blockId: null, url: null, target: null }
    })
  }
}
