import { ApolloError, gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IntegrationGrowthSpacesCreate } from '../../../../__generated__/IntegrationGrowthSpacesCreate'
import { useTeam } from '../../Team/TeamProvider'
import { GrowthSpacesSettings } from '../GrowthSpacesSettings'

export const INTEGRATION_GROWTH_SPACES_CREATE = gql`
  mutation IntegrationGrowthSpacesCreate($input: IntegrationGrowthSpacesCreateInput!) {
    integrationGrowthSpacesCreate(input: $input) {
      id
    }
  }
`

export function GrowthSpacesCreateIntegration(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { enqueueSnackbar } = useSnackbar()

  const [accessId, setAccessId] = useState<string | undefined>()
  const [accessSecret, setAccessSecret] = useState<string | undefined>()

  const [integrationGrowthSpacesCreate] =
    useMutation<IntegrationGrowthSpacesCreate>(INTEGRATION_GROWTH_SPACES_CREATE)

  async function handleClick(): Promise<void> {
    console.log('accessId', accessId)
    console.log('accessSecret', accessSecret)
    if (activeTeam == null) return
    try {
      const { data } = await integrationGrowthSpacesCreate({
        variables: {
          input: {
            accessId,
            accessSecret,
            teamId: activeTeam.id
          }
        }
      })
      if (data?.integrationGrowthSpacesCreate != null) {
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
