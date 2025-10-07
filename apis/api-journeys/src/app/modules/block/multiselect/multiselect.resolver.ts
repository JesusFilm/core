import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { Block } from '@core/prisma/journeys/client'

import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

@Resolver('MultiselectBlock')
export class MultiselectBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @ResolveField('displayResults')
  displayResults(@Parent() block: Block): boolean {
    const settings =
      (block.settings as unknown as Record<string, unknown>) ?? {}
    const value = settings.displayResults
    if (typeof value === 'boolean') return value
    return false
  }
}
