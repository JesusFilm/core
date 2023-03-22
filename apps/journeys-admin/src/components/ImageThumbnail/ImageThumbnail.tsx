import { ReactElement, ReactNode } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Icon from '@mui/material/Icon'
import BrokenImageOutlined from '@mui/icons-material/BrokenImageOutlined'
import Box from '@mui/material/Box'

interface ImageThumbnailProps {
  imageSrc?: string | null
  imageAlt?: string
  loading?: boolean
  icon: ReactNode
  error?: boolean
}

export function ImageThumbnail({
  imageSrc,
  imageAlt,
  loading,
  icon,
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
        <BrokenImageOutlined sx={{ color: 'error.main' }} />
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
        <Icon>{icon}</Icon>
      )}
    </Box>
  )
}
