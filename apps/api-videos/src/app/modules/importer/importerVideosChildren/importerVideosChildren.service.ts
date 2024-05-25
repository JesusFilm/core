import { PrismaService } from '../../../lib/prisma.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

export class ImporterVideosChildrenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService
  ) {}

  async process(): Promise<void> {
    const videoChildren = await this.prismaService.video.findMany({
      select: { id: true, childIds: true }
    })
    for (const video of videoChildren) {
      if (video.childIds.length === 0) continue
      try {
        await this.prismaService.video.update({
          where: { id: video.id },
          data: {
            children: {
              connect: video.childIds
                .filter((id) =>
                  Object.keys(
                    this.importerVideosService.usedSlugs ?? {}
                  ).includes(id)
                )
                .map((id) => ({ id }))
            }
          }
        })
      } catch (error) {
        console.log('error', error)
      }
    }
  }
}
