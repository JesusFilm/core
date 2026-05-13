// Single source of truth for the template-gallery slug shape. Used by:
//   - admin form validation (`useCollectionForm` yup matcher)
//   - admin proxy endpoints (preview + revalidate) — defense-in-depth before
//     forwarding to the public journeys app
//   - the public journeys revalidate endpoint — anti-path-traversal guard
//     before passing the value into `res.revalidate()`
//
// Lowercase ASCII letters, digits, and single hyphens between alphanumeric
// segments. No leading/trailing/consecutive hyphens, no path segments, no
// uppercase, no whitespace, no underscores. Matches the server's slug shape
// described in the `TemplateGalleryPage.slug` SDL description.
export const TEMPLATE_GALLERY_SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function isValidTemplateGallerySlug(value: unknown): value is string {
  return typeof value === 'string' && TEMPLATE_GALLERY_SLUG_RE.test(value)
}
