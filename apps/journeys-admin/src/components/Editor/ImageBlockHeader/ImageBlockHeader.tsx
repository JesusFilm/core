import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import type { UnsplashAuthor } from '../ImageBlockEditor/UnsplashGallery'
import { ImageBlockThumbnail } from '../ImageBlockThumbnail'

interface ImageBlockHeaderProps {
  selectedBlock: ImageBlock | null
  showAdd?: boolean
  showTitle?: boolean
  onDelete?: () => void
  loading?: boolean
  error?: boolean
  unsplashAuthor?: UnsplashAuthor
  Icon?: typeof SvgIcon
}

export function ImageBlockHeader({
  showAdd = false,
  showTitle = true,
  onDelete,
  loading = false,
  selectedBlock,
  error,
  unsplashAuthor,
  Icon
}: ImageBlockHeaderProps): ReactElement {
  return (
    <Stack
      data-testid="imageSrcStack"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        height: 78,
        width: '100%',
        mx: showAdd ? 0 : 4
      }}
    >
      <Stack direction="row" alignItems="center">
        <Box
          sx={{
            ml: 2,
            mr: showTitle ? 4 : 2,
            position: 'relative'
          }}
        >
          <ImageBlockThumbnail
            selectedBlock={selectedBlock != null ? selectedBlock : undefined}
            loading={loading}
            error={error}
            Icon={Icon}
          />
        </Box>
        {showTitle && (
          <Stack>
            <Typography variant="subtitle2" color="text.secondary">
              {loading
                ? 'Image is uploading...'
                : selectedBlock != null
                ? 'Selected Image'
                : showAdd
                ? 'Select Image'
                : error === true
                ? 'Upload failed'
                : 'No Image Selected'}
            </Typography>
            {unsplashAuthor != null ? (
              <Link
                href={`https://unsplash.com/@${
                  unsplashAuthor.username ?? ''
                }?utm_source=NextSteps&utm_medium=referral`}
                color="secondary.light"
                target="_blank"
                rel="noopener"
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
        )}
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
        {showAdd && selectedBlock?.src != null ? (
          <Edit2Icon color="primary" />
        ) : showAdd ? (
          <Plus2Icon color="primary" />
        ) : selectedBlock?.src != null ? (
          <Trash2Icon color="primary" data-testid="imageBlockHeaderDelete" />
        ) : (
          <></>
        )}
      </IconButton>
    </Stack>
  )
}
