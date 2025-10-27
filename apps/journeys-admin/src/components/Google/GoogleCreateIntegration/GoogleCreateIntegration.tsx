import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo, useState } from 'react'

export const INTEGRATION_GOOGLE_CREATE = gql`
  mutation IntegrationGoogleCreate($input: IntegrationGoogleCreateInput!) {
    integrationGoogleCreate(input: $input) {
      id
    }
  }
`

export function GoogleCreateIntegration(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const teamId = router.query.teamId as string

  const [code, setCode] = useState<string | undefined>()
  const [redirectUri, setRedirectUri] = useState<string | undefined>()
  const [loading, setLoading] = useState<boolean>(false)

  const [integrationGoogleCreate] = useMutation(INTEGRATION_GOOGLE_CREATE)

  const staticRedirectUri = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const origin = window.location.origin
    return `${origin}/api/integrations/google/callback`
  }, [])

  const oauthUrl = useMemo(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (clientId == null || staticRedirectUri == null) return undefined
    const state = JSON.stringify({ teamId, returnTo: window.location.pathname })
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: staticRedirectUri,
      response_type: 'code',
      scope:
        'openid email profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
      access_type: 'offline',
      include_granted_scopes: 'true',
      prompt: 'consent',
      state
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }, [staticRedirectUri, teamId])

  useEffect(() => {
    const authCode = router.query.code as string | undefined
    if (authCode != null && staticRedirectUri != null) {
      setCode(authCode)
      setRedirectUri(staticRedirectUri)
    }
  }, [router.query.code, staticRedirectUri])

  useEffect(() => {
    // Auto-submit when code is present
    if (code != null && redirectUri != null) {
      void handleClick()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, redirectUri])

  async function handleClick(): Promise<void> {
    try {
      setLoading(true)
      const { data } = await integrationGoogleCreate({
        variables: {
          input: {
            teamId,
            code,
            redirectUri
          }
        }
      })

      if (data?.integrationGoogleCreate?.id != null) {
        await router.push(`/teams/${teamId}/integrations`)
        enqueueSnackbar(t('Google settings saved'), {
          variant: 'success',
          preventDuplicate: true
        })
      } else {
        enqueueSnackbar(
          t('Google settings failed. Reload the page or try again.'),
          {
            variant: 'error',
            preventDuplicate: true
          }
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack direction="row" justifyContent="flex-end">
      <Button
        variant="outlined"
        href={oauthUrl}
        disabled={oauthUrl == null || loading}
        aria-label={t('Connect with Google')}
      >
        {t('Connect with Google')}
      </Button>
    </Stack>
  )
}
