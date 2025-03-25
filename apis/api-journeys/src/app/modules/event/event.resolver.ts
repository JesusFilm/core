import { ResolveField, Resolver } from '@nestjs/graphql'

import { Event } from '../../__generated__/graphql'

export interface DbEvent extends Event {
  __typename: string
}
@Resolver('Event')
export class EventResolver {
  @ResolveField()
  __resolveType(obj: DbEvent): string {
    return obj.__typename
  }
}
