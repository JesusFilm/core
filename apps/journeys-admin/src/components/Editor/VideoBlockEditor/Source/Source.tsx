import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import { VideoBlockUpdateInput } from '../../../../../__generated__/globalTypes'
import { VideoLibrary } from '../../VideoLibrary'

interface SourceProps {
  onChange: (block: VideoBlockUpdateInput) => Promise<void>
}

export function Source({ onChange }: SourceProps): ReactElement {
  const [open, setOpen] = useState(false)

  const onSelect = async (
    videoId: string,
    videoVariantLanguageId?: string
  ): Promise<void> => await onChange({ videoId, videoVariantLanguageId })

  return (
    <>
      <Box sx={{ py: 3, px: 6, textAlign: 'center' }}>
        <Button
          variant="text"
          size="small"
          startIcon={<SubscriptionsRounded />}
          onClick={() => setOpen(true)}
          fullWidth
        >
          Select a Video
        </Button>
      </Box>
      <VideoLibrary
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
      />
    </>
  )
}
