import { ResolveField, Resolver } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { Event } from '../../__generated__/graphql' // change
import { PrismaService } from '../../lib/prisma.service'

export interface DbEvent extends Event {
  __typename: string
}
@Resolver('Event')
export class EventResolver {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService
  ) {}

  @ResolveField()
  __resolveType(obj: DbEvent): string {
    return obj.__typename
  }
}
