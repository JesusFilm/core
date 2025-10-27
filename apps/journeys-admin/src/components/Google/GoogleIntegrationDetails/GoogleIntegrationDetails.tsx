import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import { useIntegrationQuery } from '../../../libs/useIntegrationQuery'
import { GET_INTEGRATION } from '../../../libs/useIntegrationQuery'
import { useCurrentUserLazyQuery } from '../../../libs/useCurrentUserLazyQuery'
import { useUserTeamsAndInvitesQuery } from '../../../libs/useUserTeamsAndInvitesQuery'
import { UserTeamRole } from '../../../../__generated__/globalTypes'

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
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)

  const { data, loading: integrationLoading } = useIntegrationQuery({
    teamId: router.query.teamId as string
  })
  const { loadUser, data: currentUser } = useCurrentUserLazyQuery()
  const { data: teamData } = useUserTeamsAndInvitesQuery(
    router.query.teamId != null
      ? {
          teamId: router.query.teamId as string,
          where: { role: [UserTeamRole.manager, UserTeamRole.member] }
        }
      : undefined
  )

  const [integrationGoogleUpdate] = useMutation(INTEGRATION_GOOGLE_UPDATE)
  const [integrationDelete] = useMutation(INTEGRATION_DELETE)
  useEffect(() => {
    void loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isOwner = useMemo(() => {
    const integration = data?.integrations.find((i) => i.id === integrationId)
    // supports both union variants
    // @ts-expect-error union narrowing not applied on fragmentless union here
    const userId: string | undefined = integration?.user?.id
    // @ts-expect-error accountEmail only on IntegrationGoogle
    const emailFromIntegration: string | undefined = integration?.accountEmail
    if (userId != null && userId === currentUser.id) return true
    if (
      emailFromIntegration != null &&
      emailFromIntegration.length > 0 &&
      currentUser.email.length > 0 &&
      emailFromIntegration.toLowerCase() === currentUser.email.toLowerCase()
    )
      return true
    return false
  }, [data?.integrations, integrationId, currentUser.id])

  const isTeamManager = useMemo(() => {
    return (
      teamData?.userTeams.some(
        (ut) =>
          ut.user.id === currentUser.id && ut.role === UserTeamRole.manager
      ) === true
    )
  }, [teamData?.userTeams, currentUser.id])

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
      scope:
        'openid email profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
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
        },
        refetchQueries: [
          {
            query: GET_INTEGRATION,
            variables: { teamId: router.query.teamId as string }
          }
        ],
        awaitRefetchQueries: true
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
      setConfirmOpen(false)
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
      <Stack>
        {data?.integrations
          .filter((i) => i.id === integrationId)
          .map((i) => (
            <Stack key={i.id} direction="row" justifyContent="space-between">
              <span>{t('Connected Google Account')}</span>
              {
                // @ts-expect-error union narrowing not applied
                i.accountEmail ?? t('Unknown')
              }
            </Stack>
          ))}
      </Stack>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="outlined"
          href={oauthUrl}
          disabled={
            oauthUrl == null ||
            loading ||
            integrationLoading ||
            isOwner !== true
          }
          aria-label={t('Reconnect with Google')}
        >
          {t('Reconnect with Google')}
        </Button>
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={
            loading || integrationLoading || (!isOwner && !isTeamManager)
          }
        >
          {t('Remove')}
        </Button>
      </Stack>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        dialogTitle={{
          title: t('Remove Google Integration'),
          closeButton: true
        }}
        dialogActionChildren={
          <Stack direction="row" gap={2}>
            <Button onClick={() => setConfirmOpen(false)} disabled={loading}>
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              loading={loading}
            >
              {t('Remove Integration')}
            </Button>
          </Stack>
        }
      >
        <Stack gap={2}>
          <span>
            {t(
              'Removing this Google integration will permanently delete all active Google Sheets syncs for this team. This cannot be undone.'
            )}
          </span>
        </Stack>
      </Dialog>
    </Stack>
  )
}
