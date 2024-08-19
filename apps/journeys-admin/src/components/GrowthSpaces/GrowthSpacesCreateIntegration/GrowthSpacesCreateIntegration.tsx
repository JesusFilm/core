import { gql, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
// eslint-disable-next-line no-restricted-imports
import { useTranslation } from 'react-i18next'

import {
  IntegrationGrowthSpacesCreate,
  IntegrationGrowthSpacesCreateVariables
} from '../../../../__generated__/IntegrationGrowthSpacesCreate'
import { GrowthSpacesSettings } from '../GrowthSpacesSettings'

export const INTEGRATION_GROWTH_SPACES_CREATE = gql`
  mutation IntegrationGrowthSpacesCreate(
    $input: IntegrationGrowthSpacesCreateInput!
  ) {
    integrationGrowthSpacesCreate(input: $input) {
      id
      team {
        id
      }
      type
      accessId
      accessSecretPart
      routes {
        id
        name
      }
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
  const [loading, setLoading] = useState<boolean>(false)

  const [integrationGrowthSpacesCreate] = useMutation<
    IntegrationGrowthSpacesCreate,
    IntegrationGrowthSpacesCreateVariables
  >(INTEGRATION_GROWTH_SPACES_CREATE)

  async function handleClick(): Promise<void> {
    if (
      teamId == null ||
      accessId == null ||
      accessSecret == null ||
      typeof teamId !== 'string'
    )
      return
    try {
      setLoading(true)
      const { data } = await integrationGrowthSpacesCreate({
        variables: {
          input: {
            accessId,
            accessSecret,
            teamId
          }
        },
        update(cache, { data }) {
          if (data == null) return
          cache.modify({
            fields: {
              integrations: (existingRefs = []) => {
                const newIntegration = cache.writeFragment({
                  data: data.integrationGrowthSpacesCreate,
                  fragment: gql`
                    fragment Integration on IntegrationGrowthSpaces {
                      id
                    }
                  `
                })
                return [...existingRefs, newIntegration]
              }
            }
          })
        }
      })

      if (data?.integrationGrowthSpacesCreate?.id != null) {
        await router.push(`/teams/${teamId}/integrations`)
        enqueueSnackbar(t('Growth Spaces settings saved'), {
          variant: 'success',
          preventDuplicate: true
        })
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
    } finally {
      setLoading(false)
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
