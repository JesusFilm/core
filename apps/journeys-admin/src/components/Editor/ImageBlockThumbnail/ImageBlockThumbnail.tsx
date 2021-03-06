import { ReactElement } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import ImageIcon from '@mui/icons-material/Image'
import Box from '@mui/material/Box'

interface ImageBlockThumbnailProps {
  selectedBlock: { src: string | null; alt: string } | null
  loading?: boolean
}

export function ImageBlockThumbnail({
  selectedBlock,
  loading
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
        <ImageIcon data-testid="imageBlockThumbnailPlaceholder" />
      )}
    </Box>
  )
}
