import { Create } from '@mui/icons-material'
import {
  Box,
  IconButton,
  Modal,
  Stack,
  Typography,
  useTheme
} from '@mui/material'
import { ReactElement, useState } from 'react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'
import { VideoBlockEditorSettingsPosterModal } from './Modal'

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
        width={95}
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
                    ? theme.palette.grey[400]
                    : theme.palette.primary.main
                }}
              ></Create>
            </IconButton>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <VideoBlockEditorSettingsPosterModal
                selectedBlock={selectedBlock}
                parentBlockId={parentBlockId}
                onClose={handleClose}
              />
            </Modal>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}
