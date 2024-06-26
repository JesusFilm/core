import { Injectable } from '@nestjs/common'
import { z } from 'zod'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

const videoSubtitlesSchema = z.object({
  videoId: z.string(),
  edition: z.string().nullable(),
  vttSrc: z.string(),
  srtSrc: z.string(),
  primary: z.boolean(),
  languageId: z.string()
})

type VideoSubtitles = z.infer<typeof videoSubtitlesSchema>

@Injectable()
export class ImporterVideoSubtitlesService extends ImporterService<VideoSubtitles> {
  schema = videoSubtitlesSchema

  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService
  ) {
    super()
  }

  protected async save(videoSubtitles: VideoSubtitles): Promise<void> {
    if (!this.importerVideosService.ids.includes(videoSubtitles.videoId)) {
      throw new Error(`Video with id ${videoSubtitles.videoId} not found`)
    }

    await this.prismaService.videoSubtitle.upsert({
      where: {
        videoId_edition_languageId: {
          videoId: videoSubtitles.videoId,
          edition: videoSubtitles.edition,
          languageId: videoSubtitles.languageId
        }
      },
      update: videoSubtitles,
      create: videoSubtitles
    })
  }

  protected async saveMany(videoSubtitles: VideoSubtitles[]): Promise<void> {
    await this.prismaService.videoSubtitle.createMany({
      data: videoSubtitles.filter(({ videoId }) =>
        this.importerVideosService.ids.includes(videoId)
      ),
      skipDuplicates: true
    })
  }
}