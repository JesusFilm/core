import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { omit } from 'lodash'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'

import {
  Role,
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
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
    @FromPostgresql()
  async stepBlockCreate(
    @Args('input') input: StepBlockCreateInput
  ): Promise<StepBlock> {
    const siblings = await this.blockService.getSiblings(input.journeyId)
    return await this.blockService.save({
      ...omit(input, ['journeyId', '__typename']),
      id: input.id ?? undefined,
      typename: 'StepBlock',
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
