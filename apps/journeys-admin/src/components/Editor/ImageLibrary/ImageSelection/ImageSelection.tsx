import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import IconButton from '@mui/material/IconButton'
import { ImageBlockThumbnail } from '../../ImageBlockThumbnail'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../__generated__/GetJourney'

export interface ImageSelectionProps {
  image?: ImageBlock
  startPanel?: {
    name: string
    heading: string
    hasImage: boolean
  }
}

export function ImageSelection({
  image,
  startPanel = { name: 'select', heading: 'No image selected', hasImage: false }
}: ImageSelectionProps): ReactElement {
  const [panel, setPanel] = useState(startPanel)

  function handlePanel(newPanel): void {
    switch (newPanel) {
      case 'applied':
        setPanel({
          name: 'select',
          heading: 'No image selected',
          hasImage: false
        })
        break
      case 'select':
        setPanel({
          name: 'applied',
          heading: 'Selected image',
          hasImage: true
        })
        break
    }
  }
  return (
    <Box
      sx={{
        height: 78,
        width: 285,
        flexDirection: 'row',
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Stack
        direction="row"
        sx={{
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            ml: 2,
            mr: 4,
            position: 'relative'
          }}
        >
          <ImageBlockThumbnail
            selectedBlock={panel.hasImage ? image : undefined}
          />
        </Box>
        <Stack>
          <Typography variant="subtitle2">{panel.heading}</Typography>
          <Typography
            variant="caption"
            display={panel.name === 'applied' ? 'flex' : 'none'}
          >
            {image !== undefined
              ? `${image.width} x ${image.height} pixels`
              : ''}
          </Typography>
        </Stack>
      </Stack>
      <IconButton
        onClick={() => {
          handlePanel(panel.name)
        }}
        disabled={panel.name === 'source'}
        sx={{ mr: 2, display: panel.name === 'select' ? 'none' : 'flex' }}
      >
        {panel.name === 'source' ? (
          <AddIcon color="primary" />
        ) : panel.name === 'applied' ? (
          <DeleteOutlineIcon color="primary" />
        ) : (
          <></>
        )}
      </IconButton>
    </Box>
  )
}
