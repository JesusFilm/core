import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import SvgIcon from '@mui/material/SvgIcon'
import { ReactElement } from 'react'

import Image3Icon from '@core/shared/ui/icons/Image3'
import ImageXIcon from '@core/shared/ui/icons/ImageX'

interface ImageBlockThumbnailProps {
  selectedBlock?: { src: string | null; alt: string } | null
  loading?: boolean
  Icon?: typeof SvgIcon
  error?: boolean
}

export function ImageBlockThumbnail({
  selectedBlock,
  loading,
  Icon = Image3Icon,
  error
}: ImageBlockThumbnailProps): ReactElement {
  const isUnsplash =
    selectedBlock?.src?.match(/^https:\/\/images\.unsplash\.com/) ?? false

  return (
    <Box
      sx={{
        display: 'flex',
        borderRadius: 2,
        height: 55,
        width: 55,
        backgroundColor: 'background.default',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
      data-testid="ImageBlockThumbnail"
    >
      {loading === true ? (
        <CircularProgress size={20} />
      ) : error === true ? (
        <ImageXIcon sx={{ color: 'error.main' }} />
      ) : selectedBlock?.src != null ? (
        <Box
          component="img"
          srcSet={
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            isUnsplash
              ? `${selectedBlock.src
                  .replace('w=1080', 'w=55&h=55&auto=format&dpr=2')
                  .replace('fit=max', 'fit=crop')
                  .replace('crop=entropy&', '')} 2x`
              : undefined
          }
          src={
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            isUnsplash
              ? selectedBlock.src
                  .replace('w=1080', 'w=55&h=55&auto=format')
                  .replace('fit=max', 'fit=crop')
                  .replace('crop=entropy&', '')
              : selectedBlock.src
          }
          alt={selectedBlock.alt}
          sx={{
            width: 55,
            height: 55,
            objectFit: 'cover'
          }}
        />
      ) : (
        <Icon
          data-testid="imageBlockThumbnailPlaceholder"
          sx={{ color: 'secondary.light' }}
        />
      )}
    </Box>
  )
}
