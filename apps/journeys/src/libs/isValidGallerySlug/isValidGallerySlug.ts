// Mirrors the backend guard in
// apis/api-journeys-modern/src/schema/templateGalleryPage/generateUniqueSlug.ts
// Keep in sync if SLUG_PATTERN or SLUG_MAX_LENGTH change there.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SLUG_MAX_LENGTH = 200

export function isValidGallerySlug(slug: string): boolean {
  return (
    slug.length > 0 && slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug)
  )
}
