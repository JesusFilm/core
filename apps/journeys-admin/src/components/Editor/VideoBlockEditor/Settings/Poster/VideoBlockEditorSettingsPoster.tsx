import { Create } from '@mui/icons-material'
import { Box, IconButton, Stack, Typography, useTheme } from '@mui/material'
import { ReactElement, useState } from 'react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'
import { VideoBlockEditorSettingsPosterDialog } from './Dialog'

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

  return (
    <Stack direction="row" justifyContent="space-between">
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
          <ImageBlockThumbnail selectedBlock={selectedBlock} />
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
            <VideoBlockEditorSettingsPosterDialog
              selectedBlock={selectedBlock}
              parentBlockId={parentBlockId}
              onClose={handleClose}
              open={open}
            />
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}
