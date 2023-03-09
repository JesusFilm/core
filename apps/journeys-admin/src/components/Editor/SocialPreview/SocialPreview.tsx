import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import { SocialPreviewPost } from './Post/SocialPreviewPost'

export function SocialPreview(): ReactElement {
  const { journey } = useJourney()
  return (
    <div>
      <h1>Social Preview</h1>
      <SocialPreviewPost
        journey={journey}
        avatar={<Avatar sx={{ bgcolor: '#4267B2' }}>f</Avatar>}
      />
      <SocialPreviewPost
        journey={journey}
        avatar={<Avatar sx={{ bgcolor: '#1DA1F2' }}>tw</Avatar>}
      />
    </div>
  )
}
