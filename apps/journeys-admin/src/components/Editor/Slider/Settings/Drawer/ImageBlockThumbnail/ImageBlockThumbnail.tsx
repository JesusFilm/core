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
  const IMG_WIDTH = 56
  const IMG_HEIGHT = 56

  function parseUnsplash(src) {
    return src
      .replace('w=1080', `w=${IMG_WIDTH}&h=${IMG_HEIGHT}&auto=format`)
      .replace('fit=max', 'fit=crop')
      .replace('crop=entropy&', '')
  }

  function getImageSource() {
    return parseUnsplash(selectedBlock?.src ?? '')
  }

  function getImageSourceSet() {
    return `${parseUnsplash(selectedBlock?.src ?? '').replace('auto=format', 'auto=format&dpr=2')} 2x`
  }

  return (
    <Box
      sx={{
        display: 'flex',
        borderRadius: 2,
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
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
          srcSet={isUnsplash ? getImageSourceSet() : undefined}
          src={isUnsplash ? getImageSource() : selectedBlock.src}
          alt={selectedBlock.alt}
          sx={{
            width: IMG_WIDTH,
            height: IMG_HEIGHT,
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
