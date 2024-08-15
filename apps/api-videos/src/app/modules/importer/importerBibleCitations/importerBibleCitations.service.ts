import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterBibleBooksService } from '../importerBibleBooks/importerBibleBooks.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

const bibleCitationSchema = z
  .object({
    videoId: z.string(),
    osisId: z.string(),
    bibleBookId: z.number().transform(String),
    position: z.number(),
    chapterStart: z.number(),
    chapterEnd: z.number().nullable(),
    verseStart: z
      .number()
      .nullable()
      .transform((value) => value ?? 1),
    verseEnd: z.number().nullable(),
    datastream_metadata: z.object({
      uuid: z.string()
    })
  })
  .transform((data) => ({
    ...omit(data, ['position', 'datastream_metadata']),
    id: data.datastream_metadata.uuid,
    order: data.position
  }))

type BibleCitation = z.infer<typeof bibleCitationSchema>

@Injectable()
export class ImporterBibleCitationsService extends ImporterService<BibleCitation> {
  schema = bibleCitationSchema

  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService,
    private readonly importerBibleBooksService: ImporterBibleBooksService
  ) {
    super()
  }

  protected async save(bibleCitation: BibleCitation): Promise<void> {
    if (!this.importerVideosService.ids.includes(bibleCitation.videoId)) {
      throw new Error(`Video with id ${bibleCitation.videoId} not found`)
    }
    if (!this.importerBibleBooksService.ids.includes(bibleCitation.bibleBookId))
      throw new Error(
        `BibleBook with id ${bibleCitation.bibleBookId} not found`
      )

    await this.prismaService.bibleCitation.upsert({
      where: { id: bibleCitation.id },
      update: bibleCitation,
      create: bibleCitation
    })
  }

  protected async saveMany(bibleCitations: BibleCitation[]): Promise<void> {
    await this.prismaService.bibleCitation.createMany({
      data: bibleCitations.filter(
        ({ videoId, bibleBookId }) =>
          this.importerVideosService.ids.includes(videoId) &&
          this.importerBibleBooksService.ids.includes(bibleBookId)
      ),
      skipDuplicates: true
    })
  }
}
