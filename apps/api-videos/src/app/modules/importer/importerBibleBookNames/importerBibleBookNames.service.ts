import { Injectable } from '@nestjs/common'
import { string, z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterBibleBooksService } from '../importerBibleBooks/importerBibleBooks.service'

const bibleBookNameSchema = z
  .object({
    bibleBook: z.number().transform(String),
    translatedName: string(),
    languageId: z.number().transform(String)
  })
  .transform((data) => ({
    bibleBookId: data.bibleBook,
    languageId: data.languageId,
    value: data.translatedName,
    primary: data.languageId === '529'
  }))

type BibleBookName = z.infer<typeof bibleBookNameSchema>

@Injectable()
export class ImporterBibleBookNamesService extends ImporterService<BibleBookName> {
  schema = bibleBookNameSchema

  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerBibleBooksService: ImporterBibleBooksService
  ) {
    super()
  }

  protected async save(bibleBookName: BibleBookName): Promise<void> {
    if (
      !this.importerBibleBooksService.ids.includes(bibleBookName.bibleBookId)
    ) {
      throw new Error(
        `BibleBook with id ${bibleBookName.bibleBookId} not found`
      )
    }

    await this.prismaService.bibleBookName.upsert({
      where: {
        bibleBookId_languageId: {
          bibleBookId: bibleBookName.bibleBookId,
          languageId: bibleBookName.languageId
        }
      },
      update: bibleBookName,
      create: bibleBookName
    })
  }

  protected async saveMany(bibleBookNames: BibleBookName[]): Promise<void> {
    await this.prismaService.bibleBookName.createMany({
      data: bibleBookNames.filter(({ bibleBookId }) =>
        this.importerBibleBooksService.ids.includes(bibleBookId)
      ),
      skipDuplicates: true
    })
  }
}
