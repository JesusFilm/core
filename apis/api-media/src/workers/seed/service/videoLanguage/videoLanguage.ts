import { prisma } from '../../../../lib/prisma'

export async function seedVideoLanguages(): Promise<void> {
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      availableLanguages: true,
      variants: {
        select: {
          languageId: true
        }
      }
    }
  })

  for (const video of videos) {
    const availableLanguages = Array.from(
      new Set(video.variants.map((variant) => variant.languageId))
    )

    try {
      await prisma.video.update({
        where: { id: video.id },
        data: { availableLanguages }
      })
    } catch (error) {
      console.error(`Error updating video ${video.id}:`, error)
    }
  }
}
