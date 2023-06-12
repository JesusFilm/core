import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { omit } from 'lodash'

import {
  Role,
  TypographyBlock,
  TypographyBlockCreateInput,
  TypographyBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('TypographyBlock')
export class TypographyBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async typographyBlockCreate(
    @Args('input') input: TypographyBlockCreateInput
  ): Promise<TypographyBlock> {
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...omit(input, ['journeyId', '__typename']),
      id: input.id ?? undefined,
      typename: 'TypographyBlock',
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
  async typographyBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: TypographyBlockUpdateInput
  ): Promise<TypographyBlock> {
    return await this.blockService.update(id, {
      ...omit(input, ['journeyId', '__typename'])
    })
  }
}
