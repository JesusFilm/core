import { VideoVariantDownloadQuality } from '../../../app/__generated__/graphql'
import { PrismaService } from '../../../app/lib/prisma.service'

interface Row {
  quality: string
  size: number
  uri: string
  videoVariantId: string
}

export async function coreVideoVariantDownload(
  row: Row,
  prismaService: PrismaService
): Promise<void> {
  const { quality, size, uri, videoVariantId } = row
  const videoVariantDownload = {
    quality: VideoVariantDownloadQuality[quality],
    size,
    url: uri,
    videoVariantId
  }
  await prismaService.videoVariantDownload.upsert({
    where: {
      quality_videoVariantId: {
        quality: VideoVariantDownloadQuality[quality],
        videoVariantId
      }
    },
    update: videoVariantDownload,
    create: videoVariantDownload
  })
}
