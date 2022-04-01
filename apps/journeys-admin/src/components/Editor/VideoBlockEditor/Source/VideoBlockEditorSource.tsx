import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import { Box } from '@mui/system'
import { TreeBlock } from '@core/journeys/ui'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import { VideoBlockUpdateInput } from '../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { VideoLibrary } from '../../VideoLibrary'

interface VideoBlockEditorSourceProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  parentOrder?: number | null
  parentBlockId?: string | null
  onChange: (block: VideoBlockUpdateInput) => Promise<void>
}

export function VideoBlockEditorSource({
  selectedBlock,
  onChange
}: VideoBlockEditorSourceProps): ReactElement {
  const [open, setOpen] = useState(false)

  const onSelect = async (
    videoId: string,
    videoVariantLanguageId?: string
  ): Promise<void> => {
    await onChange({ videoId, videoVariantLanguageId })
  }

  const onClick = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)

  return (
    <form>
      <Box sx={{ py: 3, px: 6, textAlign: 'center' }}>
        <Button
          variant="text"
          size="small"
          startIcon={<SubscriptionsRounded />}
          onClick={onClick}
          sx={{
            px: 2
          }}
        >
          Select a Video
        </Button>
      </Box>
      <VideoLibrary open={open} onClose={handleClose} onSelect={onSelect} />
    </form>
  )
}
