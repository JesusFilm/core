import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Box from '@mui/material/Box'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import IconButton from '@mui/material/IconButton'
import { ImageBlockThumbnail } from '../../../../../ImageBlockThumbnail'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'

export interface ImageSourceProps {
  name: string
  dimensions: string
  image?: ImageBlock
}

export function ImageSource({
  name,
  dimensions,
  image
}: ImageSourceProps): ReactElement {
  const [hasImage, setHasImage] = useState(false)

  function handleHasImage(newHasImage): void {
    setHasImage(newHasImage)
  }

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
        onClick={() => handleHasImage(!hasImage)}
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
            <ImageBlockThumbnail selectedBlock={hasImage ? image : undefined} />
          </Box>
          <Stack>
            <Typography variant="subtitle2">
              {hasImage ? name : 'Select Image'}
            </Typography>
            <Typography variant="caption">
              {hasImage ? dimensions : 'Upload your image'}
            </Typography>
          </Stack>
        </Stack>
        <IconButton
          onClick={() =>
            hasImage ? (name = 'Deleted') : (name = 'Not Deleted')
          }
        >
          {hasImage ? (
            <DeleteOutlineIcon color="primary" sx={{ mr: 2 }} />
          ) : (
            <AddIcon color="primary" sx={{ mr: 2 }} />
          )}
        </IconButton>
      </CardActionArea>
    </Card>
  )
}
