import { ReactElement } from 'react'
import Stack from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../__generated__/GetJourney'
import { CustomUrl } from './CustomUrl'
import { ImageUpload } from './ImageUpload'

interface CustomImageProps {
  onChange: (src: string) => void
  selectedBlock: ImageBlock | null
  loading?: boolean
  error?: boolean
}

export function CustomImage({
  onChange,
  selectedBlock,
  loading,
  error
}: CustomImageProps): ReactElement {
  return (
    <Stack sx={{ bgcolor: 'background.paper' }}>
      <ImageUpload
        onChange={onChange}
        loading={loading}
        selectedBlock={selectedBlock}
        error={error}
      />
      <Divider sx={{ my: 4 }} />
      <CustomUrl onChange={onChange} />
    </Stack>
  )
}
