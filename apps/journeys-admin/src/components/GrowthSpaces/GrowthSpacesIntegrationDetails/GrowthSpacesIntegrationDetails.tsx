import { ReactElement, useEffect, useState } from 'react'

import { ApolloError, gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { IntegrationGrowthSpacesDelete } from '../../../../__generated__/IntegrationGrowthSpacesDelete'
import { IntegrationGrowthSpacesUpdate } from '../../../../__generated__/IntegrationGrowthSpacesUpdate'
import { useIntegrationQuery } from '../../../libs/useIntegrationQuery'
import { GrowthSpacesSettings } from '../GrowthSpacesSettings'

export const INTEGRATION_GROWTH_SPACES_UPDATE = gql`
  mutation IntegrationGrowthSpacesUpdate($id: ID!, $input: IntegrationGrowthSpacesUpdateInput!) {
    integrationGrowthSpacesUpdate(id: $id, input: $input) {
      id
    }
  }
`

export const INTEGRATION_GROWTH_SPACES_DELETE = gql`
  mutation IntegrationGrowthSpacesDelete($id: ID!) {
    integrationDelete(id: $id) {
      id
    }
  }
`

export function GrowthSpacesIntegrationDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const integrationId = router.query.integrationId
  const [accessId, setAccessId] = useState<string | undefined>()
  const [accessSecret, setAccessSecret] = useState<string | undefined>()

  const { data, loading } = useIntegrationQuery({
    teamId: router.query.teamId as string
  })

  const [integrationsGrowthSpacesUpdate, { loading: updateLoading }] =
    useMutation<IntegrationGrowthSpacesUpdate>(INTEGRATION_GROWTH_SPACES_UPDATE)
  const [integrationsGrowthSpacesDelete, { loading: deleteLoading }] =
    useMutation<IntegrationGrowthSpacesDelete>(INTEGRATION_GROWTH_SPACES_DELETE)

  function handleError(error: ApolloError | Error): void {
    if (error instanceof ApolloError) {
      if (error.networkError != null) {
        enqueueSnackbar(
          t('Growth Spaces settings failed. Reload the page or try again.'),
          {
            variant: 'error',
            preventDuplicate: true
          }
        )
        return
      }
    }
    if (error instanceof Error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  async function handleClick(): Promise<void> {
    try {
      const { data } = await integrationsGrowthSpacesUpdate({
        variables: {
          id: integrationId,
          input: {
            accessId,
            accessSecret
          }
        }
      })
      if (data?.integrationGrowthSpacesUpdate != null) {
        enqueueSnackbar(t('Growth Spaces settings saved'), {
          variant: 'success',
          preventDuplicate: true
        })
      }
    } catch (error) {
      handleError(error)
    }
  }

  async function handleDelete(): Promise<void> {
    try {
      const { data } = await integrationsGrowthSpacesDelete({
        variables: {
          id: integrationId
        }
      })
      if (data?.integrationDelete != null) {
        enqueueSnackbar(t('Growth Spaces integration deleted'), {
          variant: 'success'
        })
        router.push(`/teams/${router.query.teamId}/integrations`)
      }
    } catch (error) {
      handleError(error)
    }
  }

  useEffect(() => {
    const selectedIntegration = data?.integrations.find(
      (integration) => integration.id === integrationId
    )
    if (selectedIntegration != null) {
      setAccessId(selectedIntegration.accessId)
      setAccessSecret(selectedIntegration.accessSecretPart)
    }
  }, [data?.integrations, integrationId])

  return (
    <GrowthSpacesSettings
      accessId={accessId}
      accessSecret={accessSecret}
      setAccessId={setAccessId}
      setAccessSecret={setAccessSecret}
      disabled={loading || updateLoading || deleteLoading}
      onClick={handleClick}
      onDelete={handleDelete}
    />
  )
}
