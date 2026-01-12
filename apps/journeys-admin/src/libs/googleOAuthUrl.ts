export function getGoogleOAuthUrl(
  teamId: string,
  returnTo?: string
): string | undefined {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (clientId == null) return undefined

  const scopes = [
    // OIDC
    'openid',
    'email',
    // Drive access is limited to files the user selects/creates with our app
    'https://www.googleapis.com/auth/drive.file',
    // Needed for creating/updating spreadsheets for visitor sync
    'https://www.googleapis.com/auth/spreadsheets'
  ].join(' ')

  const origin =
    typeof window !== 'undefined' ? window.location.origin : undefined
  if (origin == null) return undefined

  const staticRedirectUri = `${origin}/api/integrations/google/callback`
  const state = JSON.stringify({
    teamId,
    returnTo: returnTo ?? window.location.pathname
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: staticRedirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent',
    state
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}
