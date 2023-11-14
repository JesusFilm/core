import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import SvgIcon from '@mui/material/SvgIcon'
import { ReactElement } from 'react'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
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
  Icon = GridEmptyIcon,
  error
}: ImageBlockThumbnailProps): ReactElement {
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
          src={selectedBlock.src}
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
