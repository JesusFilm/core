import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { omit } from 'lodash'

import {
  CardBlock,
  CardBlockCreateInput,
  CardBlockUpdateInput,
  Role,
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
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async cardBlockCreate(
    @Args('input') input: CardBlockCreateInput
  ): Promise<CardBlock> {
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...omit(input, 'parentBlockId'),
      id: input.id ?? undefined,
      typename: 'CardBlock',
      parentBlock: { connect: { id: input.parentBlockId } },
      journey: { connect: { id: input.journeyId } },
      parentOrder: siblings.length
    })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async cardBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: CardBlockUpdateInput
  ): Promise<CardBlock> {
    return await this.blockService.update(id, input)
  }

  @ResolveField()
  fullscreen(@Parent() card: CardBlock): boolean {
    if (card.fullscreen != null) return card.fullscreen

    return false
  }
}
