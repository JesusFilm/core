import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { Block } from '@core/prisma/journeys/client'

@Resolver('StepBlock')
export class StepBlockResolver {
  @ResolveField()
  locked(@Parent() step: Block): boolean {
    if (step.locked != null) return step.locked

    return false
  }
}
