/**
 * Visual tokens + responsive helper shared across the PublicTemplateGallery
 * subcomponents.
 *
 * The public journeys app uses the website theme, which doesn't expose the
 * admin "neutral" palette tokens these designs rely on, so the values are
 * mirrored here as named constants (see GalleryTemplateCard.tsx for the same
 * rationale). Keep in sync with the Figma source if it changes.
 */

/** Editor/Palette/800 — outlined "Use" button + primary text. */
export const GALLERY_TEXT_PRIMARY = '#444451'
/** Text/secondary — creator name. */
export const GALLERY_TEXT_SECONDARY = '#6D6D7D'
/** Surface/Dark — filled "Preview" icon button. */
export const GALLERY_SURFACE_DARK = '#26262E'
/** Editor/Divider — card + media borders. */
export const GALLERY_DIVIDER = '#DEDFE0'

/**
 * Returns a value that is either fixed to the mobile breakpoint (compact /
 * admin preview) or responsive across xs→md (public page). Lets a single
 * component render both the desktop and the forced-mobile (admin) layout.
 */
export function responsiveValue<T>(
  compact: boolean,
  mobile: T,
  desktop: T
): T | { xs: T; md: T } {
  return compact ? mobile : { xs: mobile, md: desktop }
}
