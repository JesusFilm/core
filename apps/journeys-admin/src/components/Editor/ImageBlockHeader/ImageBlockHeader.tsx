import DeleteOutline from '@mui/icons-material/DeleteOutline'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { ImageBlockThumbnail } from '../ImageBlockThumbnail'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'

interface ImageBlockHeaderProps {
  selectedBlock: ImageBlock | null
  caption?: string
  header: string
  showDelete: boolean
  onDelete: () => Promise<void>
}

export function ImageBlockHeader({
  selectedBlock,
  caption = '',
  header,
  showDelete,
  onDelete
}: ImageBlockHeaderProps): ReactElement {
  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction="row"
        spacing="16px"
        data-testid="imageSrcStack"
        justifyContent="space-between"
      >
        <ImageBlockThumbnail selectedBlock={selectedBlock} />
        <Stack
          direction="column"
          justifyContent="center"
          sx={{ minWidth: 0, width: '100%' }}
        >
          {!showDelete && <Typography variant="subtitle2">{header}</Typography>}
          {showDelete && (
            <Typography
              variant="subtitle2"
              sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
            >
              {header}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {caption}
            &nbsp;
          </Typography>
        </Stack>
        {showDelete && (
          <Stack direction="column" justifyContent="center">
            <IconButton onClick={onDelete} data-testid="imageBlockHeaderDelete">
              <DeleteOutline color="primary" />
            </IconButton>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
