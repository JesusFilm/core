import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import Switch from '@mui/material/Switch'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'

export function Conditions(): ReactElement {
  const checked = false
  async function handleChange(): Promise<void> {
    console.log('switched')
  }
  return (
    <Stack>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          pb: 4
        }}
      >
        <Box>
          <Typography variant="body1">Lock the next step</Typography>
          <Typography variant="caption">
            Don&apos;t allow to skip the current card
          </Typography>
        </Box>
        <Switch checked={checked} onChange={handleChange} sx={{ ml: 'auto' }} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <InfoOutlinedIcon sx={{ mr: 4 }} />
        <Typography variant="caption">
          User can&apos;t skip interaction on the current card, like watching
          video or interacting with questions.
        </Typography>
      </Box>
    </Stack>
  )
}
