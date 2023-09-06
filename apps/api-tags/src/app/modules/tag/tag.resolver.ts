import { Inject } from '@nestjs/common'
import {
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'

import { Tag } from '.prisma/api-tags-client'

import { Translation } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Tag')
export class TagResolver {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService
  ) {}

  @Query()
  async tags(): Promise<Tag[]> {
    return await this.prismaService.tag.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  }

  @ResolveField()
  name(@Parent() tag: Tag): Translation[] {
    return (tag.nameTranslations as unknown as Translation[]) ?? []
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: string
    id: string
  }): Promise<Tag | null> {
    return await this.prismaService.tag.findUnique({
      where: { id: reference.id }
    })
  }
}
