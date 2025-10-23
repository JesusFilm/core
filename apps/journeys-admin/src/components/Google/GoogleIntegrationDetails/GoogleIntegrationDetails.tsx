import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { useIntegrationQuery } from '../../../libs/useIntegrationQuery'

export const INTEGRATION_GOOGLE_UPDATE = gql`
  mutation IntegrationGoogleUpdate(
    $id: ID!
    $input: IntegrationGoogleUpdateInput!
  ) {
    integrationGoogleUpdate(id: $id, input: $input) {
      id
    }
  }
`

export const INTEGRATION_DELETE = gql`
  mutation IntegrationDelete($id: ID!) {
    integrationDelete(id: $id) {
      id
    }
  }
`

export function GoogleIntegrationDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const integrationId = router.query.integrationId
  const [code, setCode] = useState<string | undefined>()
  const [redirectUri, setRedirectUri] = useState<string | undefined>()
  const [loading, setLoading] = useState<boolean>(false)

  const { data, loading: integrationLoading } = useIntegrationQuery({
    teamId: router.query.teamId as string
  })

  const [integrationGoogleUpdate] = useMutation(INTEGRATION_GOOGLE_UPDATE)
  const [integrationDelete] = useMutation(INTEGRATION_DELETE)

  const staticRedirectUri = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const origin = window.location.origin
    return `${origin}/api/integrations/google/callback`
  }, [])

  const oauthUrl = useMemo(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (clientId == null || staticRedirectUri == null) return undefined
    const state = JSON.stringify({
      teamId: router.query.teamId as string,
      returnTo: window.location.pathname
    })
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: staticRedirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      include_granted_scopes: 'true',
      prompt: 'consent',
      state
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }, [staticRedirectUri, router.query.teamId])

  async function handleClick(): Promise<void> {
    try {
      setLoading(true)
      const { data } = await integrationGoogleUpdate({
        variables: {
          id: integrationId,
          input: {
            code,
            redirectUri
          }
        }
      })
      if (data?.integrationGoogleUpdate?.id != null) {
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

  useEffect(() => {
    const authCode = router.query.code as string | undefined
    if (authCode != null && staticRedirectUri != null) {
      setCode(authCode)
      setRedirectUri(staticRedirectUri)
      void handleClick()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.code, staticRedirectUri])

  async function handleDelete(): Promise<void> {
    try {
      setLoading(true)
      const { data } = await integrationDelete({
        variables: {
          id: integrationId
        }
      })
      if (data?.integrationDelete?.id != null) {
        await router.push(
          `/teams/${router.query.teamId as string}/integrations`
        )
        enqueueSnackbar(t('Google integration deleted'), {
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

  useEffect(() => {
    const selectedIntegration = data?.integrations.find(
      (integration) => integration.id === integrationId
    )
    if (selectedIntegration != null) {
      setCode(undefined)
      setRedirectUri(undefined)
    }
  }, [data?.integrations, integrationId])

  return (
    <Stack gap={4}>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="outlined"
          href={oauthUrl}
          disabled={oauthUrl == null || loading || integrationLoading}
          aria-label={t('Reconnect with Google')}
        >
          {t('Reconnect with Google')}
        </Button>
        <Button onClick={handleDelete} disabled={loading || integrationLoading}>
          {t('Remove')}
        </Button>
      </Stack>
    </Stack>
  )
}
