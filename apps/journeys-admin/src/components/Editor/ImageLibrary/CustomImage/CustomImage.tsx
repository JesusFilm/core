import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../__generated__/GetJourney'
import { ImageUpload } from './ImageUpload'

interface CustomImageProps {
  onChange: (src: string) => void
  loading?: boolean
  selectedBlock: ImageBlock | null
}

export function CustomImage({
  onChange,
  loading = false,
  selectedBlock
}: CustomImageProps): ReactElement {
  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <ImageUpload
        onChange={onChange}
        loading={loading}
        selectedBlock={selectedBlock}
      />
    </Box>
  )
}
