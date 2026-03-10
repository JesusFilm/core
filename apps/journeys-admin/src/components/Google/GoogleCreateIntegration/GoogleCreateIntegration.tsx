import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { getGoogleOAuthUrl } from '../../../libs/googleOAuthUrl'

import { useIntegrationGoogleCreate } from './libs/useIntegrationGoogleCreate'

export { INTEGRATION_GOOGLE_CREATE } from './libs/useIntegrationGoogleCreate'

export function GoogleCreateIntegration(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const teamId = router.query.teamId as string
  const [oauthUrl, setOauthUrl] = useState<string | undefined>()

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

  const { loading } = useIntegrationGoogleCreate({
    teamId,
    onSuccess: async () => {
      let redirectPath =
        returnTo != null && returnTo !== ''
          ? returnTo
          : `/teams/${teamId}/integrations`

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
    },
    onError: async (error) => {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
      const fallbackPath =
        returnTo != null && returnTo !== ''
          ? returnTo
          : `/teams/${teamId}/integrations`
      await router.push(fallbackPath)
    }
  })

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
