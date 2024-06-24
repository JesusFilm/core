import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { ApolloError, gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { IntegrationGrowthSpacesCreate } from '../../../__generated__/IntegrationGrowthSpacesCreate'
import { IntegrationGrowthSpacesUpdate } from '../../../__generated__/IntegrationGrowthSpacesUpdate'
import { useTeam } from '../Team/TeamProvider'
import { ConfigField } from './ConfigField'

export const INTEGRATION_GROWTH_SPACES_CREATE = gql`
  mutation IntegrationGrowthSpacesCreate($teamId: ID!, $input: IntegrationGrowthSpaceCreateInput!) {
    integrationGrowthSpacesCreate(teamId: $teamId, input: $input) {
      id
    }
  }
`

export const INTEGRATION_GROWTH_SPACES_UPDATE = gql`
  mutation IntegrationGrowthSpacesUpdate($id: ID!, $input: IntegrationGrowthSpaceUpdateInput!) {
    integrationGrowthSpacesUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function GrowthSpacesSettings(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  // get initial values from backend
  const [accessId, setAccessId] = useState<string | undefined>()
  const [accessSecret, setAccessSecret] = useState<string | undefined>()

  const { activeTeam } = useTeam()

  console.log('activeTeam', activeTeam)

  const [integrationGrowthSpacesCreate] =
    useMutation<IntegrationGrowthSpacesCreate>(INTEGRATION_GROWTH_SPACES_CREATE)
  const [integrationsGrowthSpacesUpdate] =
    useMutation<IntegrationGrowthSpacesUpdate>(INTEGRATION_GROWTH_SPACES_UPDATE)

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

  async function handleIntegrationsCreate(teamId: string): Promise<void> {
    console.log('accessId', accessId)
    console.log('accessSecret', accessSecret)
    try {
      const { data } = await integrationGrowthSpacesCreate({
        variables: {
          teamId: teamId,
          input: {
            accessId,
            accessSecret
          }
        }
      })
      if (data?.integrationGrowthSpacesCreate != null) {
        enqueueSnackbar(t('Growth Spaces settings saved'), {
          variant: 'success'
        })
      }
    } catch (error) {
      handleError(error)
    }
  }

  async function handleIntegrationsUpdate(id: string): Promise<void> {
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
      handleError(error)
    }
  }

  async function handleClick(): Promise<void> {
    if (activeTeam == null) return
    if (accessId == null) return
    if (accessSecret == null) return

    // needs integrations to be called on team
    // if (activeTeam.integrations?.growthSpaces != null) {
    //   await handleIntegrationsUpdate(activeTeam.integrations.growthSpaces.id)
    //   return
    // }

    await handleIntegrationsCreate(activeTeam.id)
  }

  return (
    <Box
      sx={{
        p: 6,
        gap: 4,
        mt: 20,
        mx: 'auto',
        width: '60%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderRadius: 4,
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      <Typography variant="h5">App Settings</Typography>
      <ConfigField
        label="Access ID"
        value={accessId}
        onChange={(value) => setAccessId(value)}
      />
      <ConfigField
        label="Access Secret"
        value={accessSecret}
        onChange={(value) => setAccessSecret(value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={async () => await handleClick()}
        sx={{ width: '20%', alignSelf: 'flex-end' }}
      >
        Save
      </Button>
    </Box>
  )
}
