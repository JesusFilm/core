import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import { SocialPreviewPost } from './Post/SocialPreviewPost'
import { SocialPreviewMessage } from './Message/SocialPreviewMessage'

export function SocialPreview(): ReactElement {
  const { journey } = useJourney()
  return (
    <Stack
      direction="row"
      justifyContent="space-evenly"
      alignContent="start"
      divider={
        <Divider
          orientation="vertical"
          sx={{
            width: '2px',
            height: '308px',
            bgcolor: '#DCDDE5',
            display: { xs: 'none', sm: 'inherit' }
          }}
        />
      }
    >
      <SocialPreviewPost journey={journey} />
      <Box display={{ xs: 'none', sm: 'inherit' }}>
        <SocialPreviewMessage journey={journey} />
      </Box>
    </Stack>
  )
}
