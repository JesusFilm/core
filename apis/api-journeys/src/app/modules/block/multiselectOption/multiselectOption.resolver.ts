import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { MultiselectOptionBlock } from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

@Resolver('MultiselectOptionBlock')
export class MultiselectOptionBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @ResolveField('totalClicks')
  async totalClicks(@Parent() block: MultiselectOptionBlock): Promise<number> {
    return await this.prismaService.action.count({
      where: {
        blockId: block.id
      }
    })
  }
}
