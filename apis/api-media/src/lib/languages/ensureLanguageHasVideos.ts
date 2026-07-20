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

  // Only write when the flag actually needs flipping.
  if (existing.hasVideos !== true) {
    await languagesPrisma.language.update({
      where: { id: languageId },
      data: { hasVideos: true }
    })
  }

  // Always (re)upsert into the Algolia languages index. A language can already
  // be hasVideos: true (the schema default) yet be absent from the index, so
  // gating this on the flag transition leaves such languages unsearchable.
  await updateLanguageInAlgoliaFromMedia(languageId)
}
