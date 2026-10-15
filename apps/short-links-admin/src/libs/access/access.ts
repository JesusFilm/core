export const AUTH_PAGE = '/users/sign-in'
export const UNAUTHORIZED_PAGE = '/users/unauthorized'
export const DEFAULT_PAGE = '/links'
export const DOMAINS_PAGE = '/domains'

const EDITOR_ROLES = ['shortLinkEditor', 'shortLinkAdmin', 'publisher']
const ADMIN_ROLES = ['shortLinkAdmin', 'publisher']
const DOMAIN_ADMIN_ROLE = 'shortLinkAdmin'
const ADMIN_SECTIONS = [DOMAINS_PAGE]

export interface ShortLinkAccess {
  isEditor: boolean
  isAdmin: boolean
  /**
   * Adds domains, changes their settings and republishes them: the
   * `shortLinkAdmin` role itself (not `publisher`, which only reads them) or a
   * superAdmin.
   */
  isDomainAdmin: boolean
  /**
   * The `superAdmin` flag on the user (api-users), not a media role: a domain
   * admin who can also remove domains. On its own it opens the domains section
   * only.
   */
  isSuperAdmin: boolean
}

export function getShortLinkAccess(
  mediaUserRoles: readonly string[] = [],
  superAdmin: boolean | null = false
): ShortLinkAccess {
  const isAdmin = mediaUserRoles.some((role) => ADMIN_ROLES.includes(role))
  const isEditor =
    isAdmin || mediaUserRoles.some((role) => EDITOR_ROLES.includes(role))
  const isSuperAdmin = superAdmin === true
  const isDomainAdmin =
    isSuperAdmin || mediaUserRoles.includes(DOMAIN_ADMIN_ROLE)

  return { isEditor, isAdmin, isDomainAdmin, isSuperAdmin }
}

function isPathInSection(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`)
}

export function getAuthorizedRedirectPath(
  pathname: string,
  access: ShortLinkAccess
): string | undefined {
  const needsAdmin = ADMIN_SECTIONS.some((section) =>
    isPathInSection(pathname, section)
  )

  if (!access.isEditor) {
    if (!access.isSuperAdmin) return UNAUTHORIZED_PAGE
    // a superAdmin without a media role manages domains and nothing else
    return needsAdmin ? undefined : DOMAINS_PAGE
  }
  if (pathname === '/') return DEFAULT_PAGE
  if (needsAdmin && !access.isAdmin && !access.isSuperAdmin) return DEFAULT_PAGE

  return undefined
}
