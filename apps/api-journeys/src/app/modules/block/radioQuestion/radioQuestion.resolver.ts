import { UseGuards } from '@nestjs/common'
import { Args, Mutation, ResolveField, Resolver, Parent } from '@nestjs/graphql'
import { omit } from 'lodash'

import {
  Action,
  RadioOptionBlock,
  RadioQuestionBlock,
  RadioOptionBlockCreateInput,
  RadioQuestionBlockCreateInput,
  UserJourneyRole,
  RadioOptionBlockUpdateInput,
  Role
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('RadioOptionBlock')
export class RadioOptionBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @ResolveField()
  action(@Parent() block: RadioOptionBlock): Action | null {
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
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async radioOptionBlockCreate(
    @Args('input') input: RadioOptionBlockCreateInput & { __typename }
  ): Promise<RadioOptionBlock> {
    input.__typename = 'RadioOptionBlock'
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...omit(input, ['journeyId', '__typename']),
      id: input.id ?? undefined,
      typename: 'RadioOptionBlock',
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
  async radioOptionBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: RadioOptionBlockUpdateInput
  ): Promise<RadioOptionBlock> {
    return await this.blockService.update(id, input)
  }
}

@Resolver('RadioQuestionBlock')
export class RadioQuestionBlockResolver {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async radioQuestionBlockCreate(
    @Args('input') input: RadioQuestionBlockCreateInput & { __typename }
  ): Promise<RadioQuestionBlock> {
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...omit(input, ['journeyId', '__typename']),
      id: input.id ?? undefined,
      typename: 'RadioQuestionBlock',
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
  async radioQuestionBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('parentBlockId') parentBlockId: string
  ): Promise<RadioQuestionBlock> {
    return await this.blockService.update(id, { parentBlockId })
  }
}
