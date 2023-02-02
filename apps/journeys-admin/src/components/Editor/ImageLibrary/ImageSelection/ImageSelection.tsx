import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckIcon from '@mui/icons-material/Check'
import IconButton from '@mui/material/IconButton'
import CancelIcon from '@mui/icons-material/Cancel'
import { ImageBlockThumbnail } from '../../ImageBlockThumbnail'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../__generated__/GetJourney'

export interface ImageSelectionProps {
  image?: ImageBlock
  startPanel?: {
    name: string
    heading: string
    hasImage: boolean
  }
  isSource?: boolean
}

export function ImageSelection({
  image,
  isSource = false
}: ImageSelectionProps): ReactElement {
  const [panel, setPanel] = useState({
    name: 'source',
    heading: 'Select image',
    hasImage: false
  })

  function handlePanel(newPanel): void {
    switch (newPanel) {
      case 'source':
      case 'applied':
        setPanel({
          name: 'select',
          heading: 'No image selected',
          hasImage: false
        })
        break
      case 'select':
        setPanel({
          name: 'apply',
          heading: 'Apply this image?',
          hasImage: true
        })
        break
      case 'apply':
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
          {!isSource && (
            <IconButton
              onClick={() => handlePanel('source')}
              sx={{
                position: 'absolute',
                top: -16,
                left: 32,
                display: panel.name === 'apply' ? 'block' : 'none',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <CancelIcon
                sx={{
                  color: 'secondary.light',
                  backgroundColor: 'background.paper',
                  borderRadius: '12px'
                }}
              />
            </IconButton>
          )}
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
          if (!isSource) {
            handlePanel(panel.name)
          }
        }}
        sx={{ mr: 2, display: panel.name === 'select' ? 'none' : 'flex' }}
      >
        {panel.name === 'source' ? (
          <AddIcon color="primary" />
        ) : panel.name === 'apply' ? (
          <CheckIcon color="primary" />
        ) : panel.name === 'applied' ? (
          <DeleteOutlineIcon color="primary" />
        ) : (
          <></>
        )}
      </IconButton>
    </Box>
  )
}
