import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { TreeBlock } from '@core/journeys/ui/block'
import { ImageBlockThumbnail } from '../ImageBlockThumbnail'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'

interface ImageBlockHeaderProps {
  selectedBlock: ImageBlock | null
  showAdd?: boolean
  onDelete?: () => Promise<void>
  loading?: boolean
}

export function ImageBlockHeader({
  showAdd = false,
  onDelete,
  loading = false,
  selectedBlock
}: ImageBlockHeaderProps): ReactElement {
  const [hasImage, setHasImage] = useState(false)

  const imageBlock = selectedBlock as TreeBlock<ImageBlock>

  if (imageBlock != null && !hasImage) {
    setHasImage(true)
  }

  return (
    <Stack
      data-testid="imageSrcStack"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        height: 78,
        width: 285
      }}
    >
      <Stack direction="row" alignItems="center">
        <Box
          sx={{
            ml: 2,
            mr: 4,
            position: 'relative'
          }}
        >
          <ImageBlockThumbnail
            selectedBlock={hasImage ? imageBlock : undefined}
            loading={loading}
          />
        </Box>
        <Stack>
          <Typography variant="subtitle2">
            {hasImage ? 'Selected image' : 'Select image'}
          </Typography>
          <Typography variant="caption" display={hasImage ? 'flex' : 'none'}>
            {hasImage
              ? `${imageBlock.width} x ${imageBlock.height} pixels`
              : ''}
          </Typography>
        </Stack>
      </Stack>
      <IconButton
        onClick={onDelete}
        disabled={showAdd}
        sx={{
          mr: 2,
          display: !hasImage && !showAdd ? 'none' : 'flex'
        }}
      >
        {showAdd ? (
          <AddIcon color="primary" />
        ) : hasImage ? (
          <DeleteOutlineIcon
            color="primary"
            data-testid="imageBlockHeaderDelete"
          />
        ) : (
          <></>
        )}
      </IconButton>
    </Stack>
  )
}
