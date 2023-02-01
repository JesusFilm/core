import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Box from '@mui/material/Box'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { ImageBlockThumbnail } from '../../../../../ImageBlockThumbnail'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'

export interface ImageSourceProps {
  image?: ImageBlock
  onClick?: () => void
}

export function ImageSource({
  image,
  onClick
}: ImageSourceProps): ReactElement {
  return (
    <Card
      variant="outlined"
      sx={{
        width: 285,
        height: 78,
        borderRadius: 2
      }}
    >
      <CardActionArea
        data-testid="card click area"
        onClick={onClick}
        sx={{
          height: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          display: 'flex'
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
      </CardActionArea>
    </Card>
  )
}
