import { PrismaService } from '../../../lib/prisma.service'

export class ImporterVideosChildrenService {
  constructor(private readonly prismaService: PrismaService) {}

  async process(): Promise<void> {
    const videoChildren = await this.prismaService.video.findMany({
      select: { id: true, childIds: true }
    })
    for (const video of videoChildren) {
      if (video.childIds.length === 0) continue
      try {
        await this.prismaService.video.update({
          where: { id: video.id },
          data: { children: { connect: video.childIds.map((id) => ({ id })) } }
        })
      } catch (error) {
        console.log('error', error)
      }
    }
  }
}
