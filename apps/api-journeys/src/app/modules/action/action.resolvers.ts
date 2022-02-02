import { KeyAsId } from '@core/nest/decorators'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql'
import { has } from 'lodash'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import {
  Action,
  LinkActionInput,
  NavigateActionInput,
  NavigateToBlockActionInput,
  NavigateToJourneyActionInput,
  UserJourneyRole
} from '../../__generated__/graphql'
import { BlockService } from '../block/block.service'

@Resolver('Action')
export class ActionResolver {
  constructor(private readonly blockService: BlockService) {}
  @ResolveField()
  __resolveType(obj: Action): string {
    if (has(obj, ['blockId'])) return 'NavigateToBlockAction'
    if (has(obj, ['journeyId'])) return 'NavigateToJourneyAction'
    if (has(obj, ['url'])) return 'LinkAction'
    return 'NavigateAction'
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async blockUpdateNavigateAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: NavigateActionInput
  ): Promise<Action> {
    return await this.blockService.update(id, {
      action: {
        ...input,
        blockId: null,
        journeyId: null,
        url: null,
        target: null
      }
    })
  }

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
