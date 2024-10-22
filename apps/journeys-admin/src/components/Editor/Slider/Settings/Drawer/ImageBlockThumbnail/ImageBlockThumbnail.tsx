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
  function getImageSource(srcSet: boolean): string | undefined {
    const isUnsplash =
      selectedBlock?.src?.match(/^https:\/\/images\.unsplash\.com/) ?? false
    const width = '56'
    const height = '56'

    if (selectedBlock?.src != null) {
      return isUnsplash
        ? `${selectedBlock.src
            .replace(
              'w=1080',
              `w=${width}&h=${height}&auto=format${srcSet ? '&dpr=2' : ''}`
            )
            .replace('fit=max', 'fit=crop')
            .replace('crop=entropy&', '')} ${srcSet ? '2x' : ''}`
        : srcSet
          ? undefined
          : selectedBlock.src
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        borderRadius: 2,
        height: 56,
        width: 56,
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
          srcSet={getImageSource(true)}
          src={getImageSource(false)}
          alt={selectedBlock.alt}
          sx={{
            width: 56,
            height: 56,
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
