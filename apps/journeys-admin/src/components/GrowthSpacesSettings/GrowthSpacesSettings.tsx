import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { gql, useMutation } from '@apollo/client'
import { IntegrationGrowthSpacesCreate } from '../../../__generated__/IntegrationGrowthSpacesCreate'
import { useTeam } from '../Team/TeamProvider'
import { ConfigField } from './ConfigField'

export const INTEGRATION_GROWTH_SPACES_CREATE = gql`
  mutation IntegrationGrowthSpacesCreate($teamId: ID!, $input: IntegrationGrowthSpaceCreateInput!) {
    integrationGrowthSpacesCreate(teamId: $teamId, input: $input) {
      id
    }
  }
`

export function GrowthSpacesSettings(): ReactElement {
  // get initial values from backend
  const [accessId, setAccessId] = useState<string | undefined>()
  const [accessSecret, setAccessSecret] = useState<string | undefined>()

  const { activeTeam } = useTeam()

  const [integrationGrowthSpacesCreate] =
    useMutation<IntegrationGrowthSpacesCreate>(INTEGRATION_GROWTH_SPACES_CREATE)

  async function handleClick(): Promise<void> {
    if (activeTeam == null) return
    if (accessId == null || accessSecret == null) return

    const { data } = await integrationGrowthSpacesCreate({
      variables: {
        teamId: activeTeam.id,
        input: {
          accessId,
          accessSecret
        }
      }
    })
    if (data?.integrationGrowthSpacesCreate != null) {
      // todo: add snackbar notification and update access id and access secret to save that information
      console.log('data', data)
    }
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
