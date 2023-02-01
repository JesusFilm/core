import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { ImageBlockThumbnail } from '../../ImageBlockThumbnail'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../__generated__/GetJourney'

export interface ImageSelectionProps {
  image?: ImageBlock
}

export function ImageSelection({ image }: ImageSelectionProps): ReactElement {
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: 'flex-start', alignItems: 'center' }}
      >
        <Box
          sx={{
            ml: 2,
            mr: 4
          }}
        >
          <ImageBlockThumbnail
            selectedBlock={image !== undefined ? image : undefined}
          />
        </Box>
        <Stack>
          <Typography variant="subtitle2">
            {image !== undefined ? image.id : 'Select Image'}
          </Typography>
          <Typography variant="caption">
            {image !== undefined
              ? `${image.width} x ${image.height} pixels`
              : 'Upload your image'}
          </Typography>
        </Stack>
      </Stack>
      {image !== undefined ? (
        <DeleteOutlineIcon color="primary" sx={{ mr: 2 }} />
      ) : (
        <AddIcon color="primary" sx={{ mr: 2 }} />
      )}
    </Box>
  )
}
