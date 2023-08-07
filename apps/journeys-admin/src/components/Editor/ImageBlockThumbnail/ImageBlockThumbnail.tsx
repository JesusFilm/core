import BrokenImageOutlined from '@mui/icons-material/BrokenImageOutlined'
import ImageIcon from '@mui/icons-material/Image'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import SvgIcon from '@mui/material/SvgIcon'
import { ReactElement } from 'react'

interface ImageBlockThumbnailProps {
  selectedBlock?: { src: string | null; alt: string } | null
  loading?: boolean
  Icon?: typeof SvgIcon
  error?: boolean
}

export function ImageBlockThumbnail({
  selectedBlock,
  loading,
  Icon = ImageIcon,
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
    >
      {loading === true ? (
        <CircularProgress size={20} />
      ) : error === true ? (
        <BrokenImageOutlined sx={{ color: 'error.main' }} />
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
