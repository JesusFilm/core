import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
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
  return (
    <Stack
      data-testid="imageSrcStack"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        height: 78,
        width: showAdd ? '100%' : 285
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
            selectedBlock={selectedBlock != null ? selectedBlock : undefined}
            loading={loading}
          />
        </Box>
        <Stack>
          <Typography variant="subtitle2">
            {loading
              ? 'Image is uploading'
              : selectedBlock != null
              ? 'Selected Image'
              : 'Select Image'}
          </Typography>
          <Typography
            variant="caption"
            display={selectedBlock != null && !loading ? 'flex' : 'none'}
          >
            {selectedBlock != null
              ? `${selectedBlock.width} x ${selectedBlock.height} pixels`
              : ''}
          </Typography>
        </Stack>
      </Stack>
      <IconButton
        onClick={onDelete}
        disabled={showAdd}
        sx={{
          mr: 2,
          display:
            (selectedBlock == null && !showAdd) || loading ? 'none' : 'flex'
        }}
      >
        {showAdd ? (
          <AddIcon color="primary" />
        ) : selectedBlock?.src != null ? (
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
