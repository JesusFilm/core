import { ReactElement } from 'react'
import Stack from '@mui/material/Box'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../__generated__/GetJourney'
import { CustomUrl } from './CustomUrl'

interface CustomImageProps {
  selectedBlock: ImageBlock | null
  onChange: (src: string) => void
}

export function CustomImage({
  selectedBlock,
  onChange
}: CustomImageProps): ReactElement {
  return (
    <Stack sx={{ bgcolor: 'background.paper' }}>
      <CustomUrl selectedBlock={selectedBlock} onChange={onChange} />
    </Stack>
  )
}
