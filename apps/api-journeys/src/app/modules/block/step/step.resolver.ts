import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'

import {
  StepBlock,
  StepBlockCreateInput,
  StepBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('StepBlock')
export class StepBlockResolver {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  async stepBlockCreate(
    @Args('input') input: StepBlockCreateInput & { __typename }
  ): Promise<StepBlock> {
    input.__typename = 'StepBlock'
    const siblings = await this.blockService.getSiblings(input.journeyId)
    const parentOrder = input.parentOrder ?? siblings.length
    const result: StepBlock = await this.blockService.save({
      ...input,
      parentOrder: siblings.length
    })
    await this.blockService.reorderBlock(
      result.id,
      result.journeyId,
      parentOrder
    )
    return { ...result, parentOrder: parentOrder }
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async stepBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: StepBlockUpdateInput
  ): Promise<StepBlock> {
    return await this.blockService.update(id, input)
  }

  @ResolveField()
  locked(@Parent() step: StepBlock): boolean {
    if (step.locked != null) return step.locked

    return false
  }
}
