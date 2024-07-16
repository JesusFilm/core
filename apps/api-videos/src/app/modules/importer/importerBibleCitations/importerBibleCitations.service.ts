import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { z } from 'zod'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const bibleCitationSchema = z
  .object({
    videoId: z.string(),
    osisId: z.string(),
    bibleBookId: z.number().transform(String),
    position: z.number(),
    chapterStart: z.number(),
    chapterEnd: z.number().nullable(),
    verseStart: z.number(),
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

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(bibleCitation: BibleCitation): Promise<void> {
    await this.prismaService.bibleCitation.upsert({
      where: { id: bibleCitation.id },
      update: bibleCitation,
      create: bibleCitation
    })
  }

  protected async saveMany(bibleCitations: BibleCitation[]): Promise<void> {
    await this.prismaService.bibleCitation.createMany({
      data: bibleCitations,
      skipDuplicates: true
    })
  }
}
