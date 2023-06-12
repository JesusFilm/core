// Block resolver tests are in individual block type spec files

import { Args, Query, ResolveField, Resolver, Mutation } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { Block } from '.prisma/api-journeys-client'
import { PrismaService } from '../../lib/prisma.service'
import { Role, UserJourneyRole } from '../../__generated__/graphql'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import { BlockService } from './block.service'

interface DbBlock extends Block {
  __typename: string
}
@Resolver('Block')
export class BlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @ResolveField()
  __resolveType(obj: DbBlock): string {
    return obj.__typename
  }

  @Query()
  async blocks(): Promise<Block[]> {
    return await this.prismaService.block.findMany({})
  }

  @Query()
  async block(@Args('id') id: string): Promise<Block | null> {
    return await this.prismaService.block.findUnique({ where: { id } })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async blockOrderUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('parentOrder') parentOrder: number
  ): Promise<Block[]> {
    return await this.blockService.reorderBlock(id, journeyId, parentOrder)
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async blockDuplicate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('parentOrder') parentOrder?: number
  ): Promise<Block[]> {
    return await this.blockService.duplicateBlock(id, journeyId, parentOrder)
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
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
}
