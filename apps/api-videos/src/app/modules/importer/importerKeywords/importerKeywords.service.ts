import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { z } from 'zod'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

const keywordSchema = z
  .object({
    value: z.string(),
    languageId: z.string(),
    videos: z.array(z.object({ id: z.string() })).optional(),
    datastream_metadata: z.object({
      uuid: z.string()
    })
  })
  .transform((data) => ({
    ...omit(data, ['datastream_metadata']),
    id: data.datastream_metadata.uuid,
    videos: data.videos ? { connect: data.videos } : undefined
  }))

type Keyword = z.infer<typeof keywordSchema>

@Injectable()
export class ImporterKeywordsService extends ImporterService<Keyword> {
  schema = keywordSchema

  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService
  ) {
    super()
  }

  protected async checkVideos(keyword: Keyword): Promise<void> {
    if (keyword.videos && keyword.videos.connect) {
      for (const video of keyword.videos.connect) {
        if (!this.importerVideosService.ids.includes(video.id)) {
          throw new Error(`Video ${video.id} not found`)
        }
      }
    }
  }

  protected async save(keyword: Keyword): Promise<void> {
    this.checkVideos(keyword)
    await this.prismaService.keyword.upsert({
      where: {
        value_languageId: {
          value: keyword.value,
          languageId: keyword.languageId
        }
      },
      update: keyword,
      create: keyword
    })
  }

  protected async saveMany(keywords: Keyword[]): Promise<void> {
    await this.prismaService.keyword.createMany({
      data: keywords.filter((keyword) => this.checkVideos(keyword)),
      skipDuplicates: true
    })
  }
}
