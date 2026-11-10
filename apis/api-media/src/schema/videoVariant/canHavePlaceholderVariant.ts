import type { VideoLabel } from '@core/prisma/media/client'

// Only pure containers get empty placeholder ("generated parent") Variants.
// A featureFilm is a parent too (JESUS is the parent of its segments) but it
// is playable in its own right, so its Variants must only ever be real
// uploads -- a placeholder would surface as a fake, unplayable film.
//
// This is an allowlist, not a featureFilm check: every other parent label
// (anything that is not a collection or series) is playable or unknown and
// likewise never gets a placeholder. Only the paths that find parents via
// childIds with no label filter ever see such parents.
export function canHavePlaceholderVariant(
  label: VideoLabel | null | undefined
): boolean {
  return label === 'collection' || label === 'series'
}
