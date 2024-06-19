import { Injectable } from '@nestjs/common'
import { z } from 'zod'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { Prisma } from '.prisma/api-videos-client'

const bibleBookSchema = z
  .object({
    id: z.number().transform(String),
    osisId: z.string(),
    alternateName: z.string(),
    paratextAbbreviation: z.string(),
    isNewTestament: z.number().transform(Boolean),
    order: z.number()
  })
  .transform(({ alternateName, order, ...rest }) => ({
    ...rest,
    alternateNames: alternateName,
    orderNumber: order
  }))

type BibleBook = z.infer<typeof bibleBookSchema>

@Injectable()
export class importerBibleBooksService extends ImporterService<BibleBook> {
  schema = bibleBookSchema

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(bibleBook: BibleBook): Promise<void> {
    await this.prismaService.bibleBook.upsert({
      where: { id: bibleBook.id },
      update: bibleBook,
      create: bibleBook
    })
  }

  protected async saveMany(bibleBooks: BibleBook[]): Promise<void> {
    await this.prismaService.bibleBook.createMany({
      data: bibleBooks,
      skipDuplicates: true
    })
  }
}
