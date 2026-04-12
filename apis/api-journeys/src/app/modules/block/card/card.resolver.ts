import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { Block } from '@core/prisma/journeys/client'

@Resolver('CardBlock')
export class CardBlockResolver {
  @ResolveField()
  fullscreen(@Parent() card: Block): boolean {
    if (card.fullscreen != null) return card.fullscreen

    return false
  }
}
