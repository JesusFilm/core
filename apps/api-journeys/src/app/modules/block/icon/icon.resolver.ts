import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { omit } from 'lodash'
import {
  IconBlock,
  IconBlockCreateInput,
  IconBlockUpdateInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('IconBlock')
export class IconBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async iconBlockCreate(
    @Args('input') input: IconBlockCreateInput
  ): Promise<IconBlock> {
    return await this.blockService.save({
      ...omit(input, ['journeyId', '__typename']),
      id: input.id ?? undefined,
      typename: 'IconBlock',
      journey: { connect: { id: input.journeyId } },
      // Icons positions are set via parent block props, cannot be ordered.
      parentOrder: null
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
  async iconBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: IconBlockUpdateInput
  ): Promise<IconBlock> {
    return await this.blockService.update(id, input)
  }
}
