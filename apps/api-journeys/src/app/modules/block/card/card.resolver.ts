import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import {
  CardBlock,
  CardBlockCreateInput,
  CardBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('CardBlock')
export class CardBlockResolver {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  async cardBlockCreate(
    @Args('input') input: CardBlockCreateInput & { __typename }
  ): Promise<CardBlock> {
    input.__typename = 'CardBlock'
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
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async cardBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: CardBlockUpdateInput
  ): Promise<CardBlock> {
    const selectedCard: CardBlock = await this.blockService.get(id)

    // Delete existing coverBlock when replacing or removing
    if (
      selectedCard.coverBlockId != null &&
      input.coverBlockId !== selectedCard.coverBlockId
    ) {
      await this.blockService.removeBlockAndChildren(
        selectedCard.coverBlockId,
        journeyId
      )
    }

    return await this.blockService.update(id, input)
  }

  @ResolveField()
  fullscreen(@Parent() card: CardBlock): boolean {
    if (card.fullscreen != null) return card.fullscreen

    return false
  }
}
