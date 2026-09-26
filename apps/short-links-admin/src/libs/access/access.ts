export const AUTH_PAGE = '/users/sign-in'
export const UNAUTHORIZED_PAGE = '/users/unauthorized'
export const DEFAULT_PAGE = '/links'

const EDITOR_ROLES = ['shortLinkEditor', 'shortLinkAdmin', 'publisher']
const ADMIN_ROLES = ['shortLinkAdmin', 'publisher']
const ADMIN_SECTIONS = ['/domains']

export interface ShortLinkAccess {
  isEditor: boolean
  isAdmin: boolean
}

export function getShortLinkAccess(
  mediaUserRoles: readonly string[] = []
): ShortLinkAccess {
  const isAdmin = mediaUserRoles.some((role) => ADMIN_ROLES.includes(role))
  const isEditor =
    isAdmin || mediaUserRoles.some((role) => EDITOR_ROLES.includes(role))

  return { isEditor, isAdmin }
}

function isPathInSection(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`)
}

export function getAuthorizedRedirectPath(
  pathname: string,
  access: ShortLinkAccess
): string | undefined {
  if (!access.isEditor) return UNAUTHORIZED_PAGE
  if (pathname === '/') return DEFAULT_PAGE

  const needsAdmin = ADMIN_SECTIONS.some((section) =>
    isPathInSection(pathname, section)
  )
  if (needsAdmin && !access.isAdmin) return DEFAULT_PAGE

  return undefined
}
