import type { NextApiRequest, NextApiResponse } from 'next'

interface OAuthState {
  teamId?: string
  returnTo?: string
}

function getOrigin(req: NextApiRequest): string {
  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'http'
  const host = req.headers.host ?? 'localhost'
  return `${proto}://${host}`
}

function isSafeRelativePath(path: string | undefined): path is string {
  if (path == null) return false
  if (!path.startsWith('/')) return false
  // very basic check to avoid protocol-relative or absolute URLs
  if (path.startsWith('//')) return false
  return true
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { code, state, error } = req.query

  // Attempt to parse state which may be a JSON string or a bare teamId
  let parsed: OAuthState = {}
  if (typeof state === 'string' && state.length > 0) {
    try {
      parsed = JSON.parse(state) as OAuthState
    } catch {
      parsed = { teamId: state }
    }
  }

  const origin = getOrigin(req)
  const fallbackPath =
    parsed.teamId != null ? `/teams/${parsed.teamId}/integrations` : '/'

  const returnToPath = isSafeRelativePath(parsed.returnTo)
    ? parsed.returnTo
    : fallbackPath

  const redirectUrl = new URL(returnToPath, origin)

  if (typeof error === 'string' && error.length > 0) {
    redirectUrl.searchParams.set('error', error)
    res.redirect(307, redirectUrl.toString())
    return
  }

  if (typeof code === 'string' && code.length > 0) {
    redirectUrl.searchParams.set('code', code)
    res.redirect(307, redirectUrl.toString())
    return
  }

  // No code provided from Google, redirect with an error
  redirectUrl.searchParams.set('error', 'missing_code')
  res.redirect(307, redirectUrl.toString())
}
