import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { getGoogleOAuthUrl } from '../../../libs/googleOAuthUrl'

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
  const [oauthUrl, setOauthUrl] = useState<string | undefined>()

  const [integrationGoogleCreate] = useMutation(INTEGRATION_GOOGLE_CREATE)

  const staticRedirectUri = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const origin = window.location.origin
    return `${origin}/api/integrations/google/callback`
  }, [])

  const returnTo = useMemo(() => {
    return router.query.returnTo as string | undefined
  }, [router.query.returnTo])

  useEffect(() => {
    if (teamId == null) {
      setOauthUrl(undefined)
      return
    }

    const clientOAuthUrl = getGoogleOAuthUrl(teamId, returnTo)
    setOauthUrl(clientOAuthUrl)
  }, [teamId, returnTo])

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
        let redirectPath =
          returnTo != null && returnTo !== ''
            ? returnTo
            : `/teams/${teamId}/integrations`

        // If returnTo includes openSyncDialog parameter, add integrationCreated parameter
        if (returnTo != null && returnTo.includes('openSyncDialog=true')) {
          const url = new URL(redirectPath, window.location.origin)
          url.searchParams.set('integrationCreated', 'true')
          redirectPath = url.pathname + url.search
        }

        await router.push(redirectPath)
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
