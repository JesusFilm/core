// Block resolver tests are in individual block type spec files

import { ResolveField, Resolver } from '@nestjs/graphql'
import { Response } from '../../__generated__/graphql' // change
import { EventService } from './event.service'

interface DbResponse extends Response {
  __typename: string
}
@Resolver('Event')
export class EventResolver {
  constructor(private readonly eventService: EventService) {}
  @ResolveField()
  __resolveType(obj: DbResponse): string {
    return obj.__typename
  }
}
