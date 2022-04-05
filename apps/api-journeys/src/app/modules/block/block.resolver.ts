// Block resolver tests are in individual block type spec files

import {
  Args,
  Query,
  ResolveField,
  Resolver,
  Mutation,
  Parent
} from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { Block, UserJourneyRole } from '../../__generated__/graphql'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import { BlockService } from './block.service'

interface DbBlock extends Block {
  __typename: string
}
@Resolver('Block')
export class BlockResolver {
  constructor(private readonly blockService: BlockService) {}
  @ResolveField()
  __resolveType(obj: DbBlock): string {
    return obj.__typename
  }

  @Query()
  async blocks(): Promise<Block[]> {
    return await this.blockService.getAll()
  }

  @Query()
  async block(@Args('id') id: string): Promise<Block> {
    return await this.blockService.get(id)
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async blockOrderUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('parentOrder') parentOrder: number
  ): Promise<Block[]> {
    const selectedBlock: Block = await this.blockService.get(id)

    if (
      selectedBlock.journeyId === journeyId &&
      selectedBlock.parentOrder != null
    ) {
      const siblings = await this.blockService.getSiblings(
        journeyId,
        selectedBlock.parentBlockId
      )
      siblings.splice(selectedBlock.parentOrder, 1)
      siblings.splice(parentOrder, 0, selectedBlock)

      return await this.blockService.reorderSiblings(siblings)
    }
    return []
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async blockDelete(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('parentBlockId') parentBlockId?: string
  ): Promise<Block[]> {
    return await this.blockService.removeBlockAndChildren(
      id,
      journeyId,
      parentBlockId
    )
  }

  async siblings(@Parent() block: Block): Promise<Block[]> {
    return await this.blockService.getSiblings(
      block.journeyId,
      block.parentBlockId
    )
  }

  async updateOrder(
    @Args('id') id: string,
    @Args('parentOrder') parentOrder: number
  ): Promise<Block> {
    return await this.blockService.update(id, { parentOrder })
  }
}
