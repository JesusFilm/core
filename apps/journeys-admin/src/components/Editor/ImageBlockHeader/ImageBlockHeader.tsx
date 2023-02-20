import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { ImageBlockThumbnail } from '../ImageBlockThumbnail'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import type { UnsplashAuthor } from '../ImageLibrary/UnsplashGallery'

interface ImageBlockHeaderProps {
  selectedBlock: ImageBlock | null
  showAdd?: boolean
  onDelete?: () => Promise<void>
  loading?: boolean
  unsplashAuthor?: UnsplashAuthor
}

export function ImageBlockHeader({
  showAdd = false,
  onDelete,
  loading = false,
  selectedBlock,
  unsplashAuthor
}: ImageBlockHeaderProps): ReactElement {
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
            selectedBlock={selectedBlock != null ? selectedBlock : undefined}
            loading={loading}
          />
        </Box>
        <Stack>
          <Typography variant="subtitle2" color="text.secondary">
            {loading
              ? 'Image is uploading...'
              : selectedBlock != null
              ? 'Selected Image'
              : showAdd
              ? 'Select Image'
              : 'No Image Selected'}
          </Typography>
          {unsplashAuthor != null ? (
            <Link
              href={`https://unsplash.com/@${
                unsplashAuthor.username ?? ''
              }?utm_source=NextSteps&utm_medium=referral`}
              color="secondary.light"
            >
              <Typography variant="caption">
                {unsplashAuthor.fullname}
              </Typography>
            </Link>
          ) : (
            <Typography
              variant="caption"
              display={selectedBlock != null ? 'flex' : 'none'}
              color="text.secondary"
            >
              {selectedBlock != null
                ? `${selectedBlock.width} x ${selectedBlock.height} pixels`
                : ''}
            </Typography>
          )}
        </Stack>
      </Stack>
      <IconButton
        onClick={onDelete}
        disabled={showAdd}
        sx={{
          mr: 2,
          display: selectedBlock == null && !showAdd ? 'none' : 'flex'
        }}
      >
        {showAdd ? (
          <AddIcon color="primary" />
        ) : selectedBlock != null ? (
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
