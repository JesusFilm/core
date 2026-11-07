import type { VideoLabel } from '@core/prisma/media/client'

// Only pure containers get empty placeholder ("generated parent") Variants.
// A featureFilm is a parent too (JESUS is the parent of its segments) but it
// is playable in its own right, so its Variants must only ever be real
// uploads -- a placeholder would surface as a fake, unplayable film.
export function canHavePlaceholderVariant(
  label: VideoLabel | null | undefined
): boolean {
  return label === 'collection' || label === 'series'
}
