import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Icon from '@mui/material/Icon'
import { ReactElement, ReactNode } from 'react'

import FilePlus1 from '@core/shared/ui/icons/FilePlus1'
import ImageX from '@core/shared/ui/icons/ImageX'

interface ImageThumbnailProps {
  imageSrc?: string | null
  imageAlt?: string
  loading?: boolean
  icon?: ReactNode
  error?: boolean
}

export function ImageThumbnail({
  imageSrc,
  imageAlt,
  loading,
  icon = <FilePlus1 />,
  error
}: ImageThumbnailProps): ReactElement {
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
    >
      {loading === true ? (
        <CircularProgress size={20} />
      ) : error === true ? (
        <ImageX sx={{ color: 'error.main' }} />
      ) : imageSrc != null ? (
        <Box
          component="img"
          src={imageSrc}
          alt={imageAlt}
          sx={{
            width: 55,
            height: 55,
            objectFit: 'cover'
          }}
        />
      ) : (
        <Icon
          data-testid="imageThumbnailPlaceholder"
          sx={{ color: 'secondary.light' }}
        >
          {icon}
        </Icon>
      )}
    </Box>
  )
}
