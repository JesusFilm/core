import { ReactElement } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import ImageIcon from '@mui/icons-material/Image'
import SvgIcon from '@mui/material/SvgIcon'
import BrokenImageOutlined from '@mui/icons-material/BrokenImageOutlined'
import Box from '@mui/material/Box'
import { ApolloError } from '@apollo/client'

interface ImageBlockThumbnailProps {
  selectedBlock?: { src: string | null; alt: string } | null
  loading?: boolean
  Icon?: typeof SvgIcon
  error?: ApolloError
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
      ) : error != null ? (
        <BrokenImageOutlined />
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
        <Icon data-testid="imageBlockThumbnailPlaceholder" />
      )}
    </Box>
  )
}
