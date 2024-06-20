import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { ConfigField } from './ConfigField'

export function GrowthSpacesSettings(): ReactElement {
  // get the key values from the backend
  const [accessKey, setAccessKey] = useState('accessKey')
  const [apiKey, setApiKey] = useState('apiKey')

  function handleSave(): void {
    console.log('accessKey', accessKey)
    console.log('apiKey', apiKey)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      <Typography variant="h5">App Settings</Typography>
      <ConfigField
        label="Access Key"
        initialValue={accessKey}
        onChange={(value) => setAccessKey(value)}
      />
      <ConfigField
        label="Api Key"
        initialValue={apiKey}
        onChange={(value) => setApiKey(value)}
      />
      <Button variant="contained" color="primary" onClick={handleSave}>
        Save
      </Button>
    </Box>
  )
}
