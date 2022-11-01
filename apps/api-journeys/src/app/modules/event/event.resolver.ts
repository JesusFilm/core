// Block resolver tests are in individual block type spec files

import { ResolveField, Resolver } from '@nestjs/graphql'

@Resolver('Event')
export class EventResolver {
  @ResolveField()
  __resolveType(obj: { __typename: string }): string {
    return obj.__typename
  }
}
