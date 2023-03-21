import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { SocialPreviewPost } from './Post/SocialPreviewPost'
import { SocialPreviewMessage } from './Message/SocialPreviewMessage'

export function SocialPreview(): ReactElement {
  const { journey } = useJourney()
  return (
    <Stack
      direction="row"
      justifyContent="space-evenly"
      divider={
        <Divider
          orientation="vertical"
          sx={{ width: '2px', height: '308px', bgcolor: '#DCDDE5' }}
        />
      }
    >
      <SocialPreviewPost journey={journey} />
      <SocialPreviewMessage journey={journey} />
    </Stack>
  )
}
