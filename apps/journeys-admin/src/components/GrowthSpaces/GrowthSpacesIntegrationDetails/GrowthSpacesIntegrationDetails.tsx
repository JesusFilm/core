import { ReactElement, useState } from 'react'

import { ApolloError, gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { IntegrationGrowthSpacesUpdate } from '../../../../__generated__/IntegrationGrowthSpacesUpdate'
import { useTeam } from '../../Team/TeamProvider'
import { GrowthSpacesSettings } from '../GrowthSpacesSettings'

export const INTEGRATION_GROWTH_SPACES_UPDATE = gql`
  mutation IntegrationGrowthSpacesUpdate($id: ID!, $input: IntegrationGrowthSpacesUpdateInput!) {
    integrationGrowthSpacesUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function GrowthSpacesIntegrationDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const integrationId = router.query.integrationId
  const { activeTeam } = useTeam()

  // get values from backend

  const [accessId, setAccessId] = useState<string | undefined>()
  const [accessSecret, setAccessSecret] = useState<string | undefined>()

  const [integrationsGrowthSpacesUpdate] =
    useMutation<IntegrationGrowthSpacesUpdate>(INTEGRATION_GROWTH_SPACES_UPDATE)

  async function handleClick(id: string): Promise<void> {
    try {
      const { data } = await integrationsGrowthSpacesUpdate({
        variables: {
          id: id,
          input: {
            accessId,
            accessSecret
          }
        }
      })
      if (data?.integrationGrowthSpacesUpdate != null) {
        enqueueSnackbar(t('Growth Spaces settings saved'), {
          variant: 'success'
        })
      }
    } catch (error) {
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
  }

  return (
    <GrowthSpacesSettings
      accessId={accessId}
      accessSecret={accessSecret}
      setAccessId={setAccessId}
      setAccessSecret={setAccessSecret}
      onClick={handleClick}
    />
  )
}
