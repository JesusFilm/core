import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { ConfigField } from './ConfigField'

export function GrowthSpacesSettings(): ReactElement {
  // get initial values from backend
  const [accessId, setAccessId] = useState<string | undefined>()
  const [accessSecret, setAccessSecret] = useState<string | undefined>()

  function handleClick(): void {
    console.log('accessId', accessId)
    console.log('accessSecret', accessSecret)
  }

  return (
    <Box
      sx={{
        p: 6,
        gap: 4,
        m: 'auto',
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
        initialValue={accessId}
        onChange={(value) => setAccessId(value)}
      />
      <ConfigField
        label="Access Secret"
        initialValue={accessSecret}
        onChange={(value) => setAccessSecret(value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        sx={{ width: '20%', alignSelf: 'flex-end' }}
      >
        Save
      </Button>
    </Box>
  )
}
