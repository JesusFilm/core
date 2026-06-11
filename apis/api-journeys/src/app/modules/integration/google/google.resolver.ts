import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { Integration } from '@core/prisma/journeys/client'

@Resolver('IntegrationGoogle')
export class IntegrationGoogleResolver {
  @ResolveField()
  user(
    @Parent() integration: Integration
  ): { __typename: 'User'; id: string } | null {
    if (integration.userId == null) return null
    return { __typename: 'User', id: integration.userId }
  }
}
