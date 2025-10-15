import { gql, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { useIntegrationQuery } from '../../../libs/useIntegrationQuery'
import { GoogleSettings } from '../GoogleSettings/GoogleSettings'

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
    <GoogleSettings
      code={code}
      redirectUri={redirectUri}
      setCode={setCode}
      setRedirectUri={setRedirectUri}
      disabled={loading || integrationLoading}
      onClick={handleClick}
      onDelete={handleDelete}
    />
  )
}
