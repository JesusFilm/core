import Create from '@mui/icons-material/Create'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

import { VideoBlockEditorSettingsPosterLibrary } from './Library'

interface BackgroundMediaCoverImageProps {
  selectedBlock: ImageBlock | null
  parentBlockId: string | undefined
  disabled?: boolean
}

export function VideoBlockEditorSettingsPoster({
  selectedBlock,
  parentBlockId,
  disabled = false
}: BackgroundMediaCoverImageProps): ReactElement {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const handleOpen = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)

  const [loading, setLoading] = useState(false)
  const handleLoading = (): void => setLoading(true)
  const handleLoad = (): void => setLoading(false)

  return (
    <Stack direction="row" justifyContent="space-between" spacing={3}>
      <Stack direction="column" justifyContent="center">
        <Typography
          variant="subtitle2"
          color={disabled ? theme.palette.action.disabled : ''}
          sx={{ letterSpacing: 0 }}
        >
          Cover Image
        </Typography>
        <Typography
          variant="caption"
          color={disabled ? theme.palette.action.disabled : ''}
        >
          Appears while video is loading
        </Typography>
      </Stack>
      <Box
        height={62}
        sx={{ backgroundColor: 'rgba(0, 0, 0, 0.06)', p: 1 }}
        borderRadius={2}
      >
        <Stack direction="row" justifyContent="space-around">
          <ImageBlockThumbnail
            selectedBlock={selectedBlock}
            loading={loading}
          />
          <Stack
            direction="column"
            justifyContent="center"
            sx={{ paddingRight: 1 }}
          >
            <IconButton
              onClick={handleOpen}
              disabled={disabled}
              data-testid="posterCreateButton"
            >
              <Create
                sx={{
                  color: disabled
                    ? theme.palette.action.disabled
                    : theme.palette.primary.main
                }}
              />
            </IconButton>
            <VideoBlockEditorSettingsPosterLibrary
              selectedBlock={selectedBlock}
              parentBlockId={parentBlockId}
              onClose={handleClose}
              open={open}
              onLoading={handleLoading}
              onLoad={handleLoad}
            />
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}
