import { prisma as languagesPrisma } from '@core/prisma/languages/client'

import { updateLanguageInAlgoliaFromMedia } from './updateLanguageInAlgolia'

export async function ensureLanguageHasVideosTrue(
  languageId: string
): Promise<void> {
  if (languageId.trim() === '') return

  const existing = await languagesPrisma.language.findUnique({
    where: { id: languageId },
    select: { id: true, hasVideos: true }
  })

  if (existing == null) return
  if (existing.hasVideos === true) return

  await languagesPrisma.language.update({
    where: { id: languageId },
    data: { hasVideos: true }
  })

  await updateLanguageInAlgoliaFromMedia(languageId)
}
