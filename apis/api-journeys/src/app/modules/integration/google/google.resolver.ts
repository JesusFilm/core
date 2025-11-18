import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

// Use a minimal shape to avoid tight coupling to Prisma selection types.
interface IntegrationWithOptionalUserId {
  userId?: string | null
}

@Resolver('IntegrationGoogle')
export class IntegrationGoogleResolver {
  @ResolveField()
  user(
    @Parent() integration: IntegrationWithOptionalUserId
  ): { __typename: 'User'; id: string } | null {
    if (integration.userId == null) return null
    return { __typename: 'User', id: integration.userId }
  }
}
