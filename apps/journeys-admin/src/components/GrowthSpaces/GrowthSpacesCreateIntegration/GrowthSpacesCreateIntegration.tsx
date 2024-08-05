import { gql, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
// eslint-disable-next-line no-restricted-imports
import { useTranslation } from 'react-i18next'

import { IntegrationGrowthSpacesCreate } from '../../../../__generated__/IntegrationGrowthSpacesCreate'
import { GrowthSpacesSettings } from '../GrowthSpacesSettings'

export const INTEGRATION_GROWTH_SPACES_CREATE = gql`
  mutation IntegrationGrowthSpacesCreate(
    $input: IntegrationGrowthSpacesCreateInput!
  ) {
    integrationGrowthSpacesCreate(input: $input) {
      id
    }
  }
`

export function GrowthSpacesCreateIntegration(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const teamId = router.query.teamId
  const [accessId, setAccessId] = useState<string | undefined>()
  const [accessSecret, setAccessSecret] = useState<string | undefined>()

  const [integrationGrowthSpacesCreate, { loading }] =
    useMutation<IntegrationGrowthSpacesCreate>(INTEGRATION_GROWTH_SPACES_CREATE)

  async function handleClick(): Promise<void> {
    if (teamId == null) return
    try {
      const { data } = await integrationGrowthSpacesCreate({
        variables: {
          input: {
            accessId,
            accessSecret,
            teamId
          }
        }
      })

      if (data?.integrationGrowthSpacesCreate?.id != null) {
        enqueueSnackbar(t('Growth Spaces settings saved'), {
          variant: 'success',
          preventDuplicate: true
        })
        await router.push(
          `/teams/${teamId as string}/integrations/${
            data.integrationGrowthSpacesCreate.id
          }`
        )
      } else {
        enqueueSnackbar(
          t('Growth Spaces settings failed. Reload the page or try again.'),
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
    }
  }

  return (
    <GrowthSpacesSettings
      accessId={accessId}
      accessSecret={accessSecret}
      setAccessId={(value) => setAccessId(value)}
      setAccessSecret={(value) => setAccessSecret(value)}
      disabled={loading}
      onClick={handleClick}
    />
  )
}
