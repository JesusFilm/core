import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import get from 'lodash/get'

import { Action, Block } from '@core/prisma/journeys/client'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('Action')
export class ActionResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField()
  __resolveType(obj: Action): string {
    if (get(obj, 'blockId') != null) return 'NavigateToBlockAction'
    if (get(obj, 'email') != null) return 'EmailAction'
    if (get(obj, 'phone') != null) return 'PhoneAction'
    return 'LinkAction'
  }

  @ResolveField('parentBlock')
  async parentBlock(
    @Parent() action: Action & { parentBlock?: Block }
  ): Promise<Block | null> {
    if (action.parentBlock != null) return action.parentBlock

    return await this.prismaService.block.findUnique({
      where: { id: action.parentBlockId }
    })
  }
}
