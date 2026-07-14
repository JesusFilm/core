/**
 * Normalise a configured admin URL (`NEXT_PUBLIC_JOURNEYS_ADMIN_URL`) into an
 * absolute https base. Guards against schemeless values (e.g.
 * `admin.staging.local`) which would otherwise throw inside `new URL` and
 * crash the page at render. In the fallback path we re-prepend `https://` so
 * the resulting href is an absolute URL — without the scheme, the browser
 * resolves it as a relative path against the current host
 * (`https://gallery.host/admin.staging.local/...`) instead of navigating to
 * the admin app.
 */
export function sanitiseAdminBase(adminUrl: string): string {
  try {
    return new URL('/', adminUrl).origin
  } catch {
    // Trim whitespace before stripping `/` so a misconfigured env var with
    // padding still produces a parsable URL — `https://  admin.local  /...`
    // would be rejected by the browser; `https://admin.local/...` works.
    const sanitised = adminUrl.trim().replace(/^\/+/, '').replace(/\/+$/, '')
    return `https://${sanitised}`
  }
}

/**
 * Build the admin "Use Template" deep link (`/?useTemplate=<id>`).
 */
export function buildUseTemplateHref(
  adminUrl: string,
  journeyId: string
): string {
  try {
    const url = new URL('/', adminUrl)
    url.searchParams.set('useTemplate', journeyId)
    return url.toString()
  } catch {
    return `${sanitiseAdminBase(adminUrl)}/?useTemplate=${encodeURIComponent(journeyId)}`
  }
}

/**
 * Build the admin template customization entry point
 * (`/templates/<id>/customize`). Customizable templates skip the
 * "Copy to team" dialog and land directly in the guided editor.
 */
export function buildCustomizeHref(
  adminUrl: string,
  journeyId: string
): string {
  try {
    return new URL(
      `/templates/${encodeURIComponent(journeyId)}/customize`,
      adminUrl
    ).toString()
  } catch {
    return `${sanitiseAdminBase(adminUrl)}/templates/${encodeURIComponent(journeyId)}/customize`
  }
}
