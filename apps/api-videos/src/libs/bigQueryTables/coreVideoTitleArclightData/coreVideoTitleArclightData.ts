import { PrismaService } from '../../../app/lib/prisma.service'

interface Row {
  title: string
  languageId: number
  primary: number
  videoId: string
}

export async function coreVideoTitleArclightData(
  row: Row,
  prismaService: PrismaService
): Promise<void> {
  const { title, languageId, videoId } = row
  const videoTitle = {
    value: title,
    languageId: languageId.toString(),
    videoId,
    primary: true
  }

  await prismaService.videoTitle.upsert({
    where: {
      videoId_languageId: { videoId, languageId: languageId.toString() }
    },
    update: videoTitle,
    create: videoTitle
  })
}
