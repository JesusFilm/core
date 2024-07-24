import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { BibleBook } from '.prisma/api-videos-client'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('BibleCitation')
export class BibleCitationResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField('bibleBook')
  async bibleBook(@Parent() bibleCitation): Promise<BibleBook> {
    return (await this.prismaService.bibleBook.findUnique({
      where: { id: bibleCitation.bibleBookId }
    })) as unknown as BibleBook
  }
}
