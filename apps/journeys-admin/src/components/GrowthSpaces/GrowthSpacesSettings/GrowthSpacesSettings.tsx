import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { ConfigField } from './ConfigField'

interface GrowthSpacesSettingsProps {
  accessId?: string
  accessSecret?: string
  setAccessId?: (value: string) => void
  setAccessSecret?: (value: string) => void
  onClick?: () => void
}

// TODO: add remove button
export function GrowthSpacesSettings({
  accessId,
  accessSecret,
  setAccessId,
  setAccessSecret,
  onClick
}): ReactElement {
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
        onClick={onClick}
        sx={{ width: '20%', alignSelf: 'flex-end' }}
      >
        Save
      </Button>
    </Box>
  )
}
