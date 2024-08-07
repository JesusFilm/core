import { Injectable } from '@nestjs/common'
import { string, z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const bibleBookSchema = z.object({
  id: z.number().transform(String),
  name: string(),
  osisId: z.string(),
  alternateName: z.string().nullable(),
  paratextAbbreviation: z.string(),
  isNewTestament: z.number().transform(Boolean),
  order: z.number(),
  languageId: z.number().transform(String)
})

type BibleBook = z.infer<typeof bibleBookSchema>

@Injectable()
export class ImporterBibleBooksService extends ImporterService<BibleBook> {
  schema = bibleBookSchema
  ids: string[] = []

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  async getExistingIds(): Promise<void> {
    return await this.prismaService.bibleBook
      .findMany({
        select: { id: true }
      })
      .then((result) => {
        this.ids = result.map(({ id }) => id)
      })
  }

  trimBibleBook(bibleBook: BibleBook): Omit<BibleBook, 'name' | 'languageId'> {
    const { name, languageId, ...trimmedBibleBook } = bibleBook
    return trimmedBibleBook
  }

  protected async save(bibleBook: BibleBook): Promise<void> {
    const trimmedBibleBook = this.trimBibleBook(bibleBook)
    await this.prismaService.bibleBook.upsert({
      where: { id: bibleBook.id },
      update: {
        ...trimmedBibleBook,
        name: {
          upsert: {
            where: {
              bibleBookId_languageId: {
                bibleBookId: bibleBook.id,
                languageId: bibleBook.languageId
              }
            },
            update: {
              value: bibleBook.name,
              primary: true
            },
            create: {
              value: bibleBook.name,
              languageId: bibleBook.languageId,
              primary: true
            }
          }
        }
      },
      create: {
        ...trimmedBibleBook,
        name: {
          create: {
            value: bibleBook.name,
            languageId: bibleBook.languageId,
            primary: true
          }
        }
      }
    })
    this.ids.push(bibleBook.id)
  }

  protected async saveMany(bibleBooks: BibleBook[]): Promise<void> {
    const trimmedBibleBooks = bibleBooks.map((bibleBook) =>
      this.trimBibleBook(bibleBook)
    )

    const bibleBookNames = bibleBooks.map((bibleBook) => ({
      value: bibleBook.name,
      languageId: bibleBook.languageId,
      primary: true,
      bibleBookId: bibleBook.id
    }))

    await this.prismaService.bibleBook.createMany({
      data: trimmedBibleBooks.filter(({ id }) => !this.ids.includes(id)),
      skipDuplicates: true
    })

    this.ids = bibleBooks.map(({ id }) => id)

    await this.prismaService.bibleBookName.createMany({
      data: bibleBookNames.filter(({ bibleBookId }) =>
        this.ids.includes(bibleBookId)
      ),
      skipDuplicates: true
    })
  }
}
