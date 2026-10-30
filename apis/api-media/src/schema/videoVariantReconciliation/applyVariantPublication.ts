import { videoCacheReset } from '../../lib/videoCacheReset'
import {
  addLanguageToVideo,
  removeLanguageFromVideoIfUnused,
  updateParentCollectionLanguages
} from '../video/lib/updateAvailableLanguages'

import { publishParentVariants } from './reconcileParentVariants'

type PublicationChange = {
  id: string
  videoId: string
  languageId: string
  slug: string
  published: boolean
}

// What an explicit publish/Draft changes for viewers -- the Variant's
// language on its Video and on every container above it -- applied inline by
// videoVariantUpdate so the editor sees the result on Save rather than after
// the next 15-minute sweep. Algolia is left to the reconciliation
// videoVariantUpdate also requests; every write here is idempotent, so the
// sweep repeating them later is harmless.
export async function applyVariantPublication(
  variant: PublicationChange
): Promise<void> {
  if (variant.published) {
    await publishParentVariants(variant)
    await addLanguageToVideo(variant.videoId, variant.languageId)
  } else {
    await removeLanguageFromVideoIfUnused(variant.videoId, variant.languageId)
  }
  await updateParentCollectionLanguages(variant.videoId)
  await videoCacheReset(variant.videoId)
}
