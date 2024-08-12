import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

@Injectable()
export class ImporterVideosChildrenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService
  ) {}

  async process(): Promise<void> {
    console.log('beginning processing children')
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
                .filter((id) => this.importerVideosService.ids.includes(id))
                .map((id) => ({ id }))
            }
          }
        })
      } catch (error) {
        console.log('error', error)
      }
    }
    console.log('finished processing children')
  }
}
