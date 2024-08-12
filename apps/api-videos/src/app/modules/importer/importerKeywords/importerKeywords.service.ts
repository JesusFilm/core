import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

const keywordSchema = z
  .object({
    value: z.string(),
    languageId: z.number(),
    videoIds: z.string().optional(),
    datastream_metadata: z.object({
      uuid: z.string()
    })
  })
  .transform((data) => ({
    ...omit(data, ['videoIds', 'datastream_metadata']),
    id: data.datastream_metadata.uuid,
    languageId: data.languageId.toString(),
    videos:
      data.videoIds != null
        ? { connect: data.videoIds.split(',').map((id) => ({ id })) }
        : undefined
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

  protected filterValidVideos(keyword: Keyword): Keyword {
    if (keyword.videos?.connect != null) {
      const validVideoIds = this.importerVideosService.ids
      keyword.videos.connect = keyword.videos.connect.filter((v) =>
        validVideoIds.some((id) => id === v.id)
      )
    }
    return keyword
  }

  protected async save(keyword: Keyword): Promise<void> {
    const filteredKeyword = this.filterValidVideos(keyword)
    await this.prismaService.keyword.upsert({
      where: {
        value_languageId: {
          value: filteredKeyword.value,
          languageId: filteredKeyword.languageId
        }
      },
      update: filteredKeyword,
      create: filteredKeyword
    })
  }

  protected async saveMany(keywords: Keyword[]): Promise<void> {
    const filteredKeywords = keywords.map((keyword) =>
      this.filterValidVideos(keyword)
    )

    await this.prismaService.keyword.createMany({
      data: filteredKeywords.map((keyword) => ({
        id: keyword.id,
        value: keyword.value,
        languageId: keyword.languageId
      })),
      skipDuplicates: true
    })

    for (const keyword of filteredKeywords) {
      if (
        keyword.videos?.connect != null &&
        keyword.videos.connect.length > 0
      ) {
        await this.prismaService.keyword.update({
          where: { id: keyword.id },
          data: {
            videos: {
              connect: keyword.videos.connect
            }
          }
        })
      }
    }
  }
}
