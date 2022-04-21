import { ReactElement } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import ImageIcon from '@mui/icons-material/Image'
import Image from 'next/image'
import Box from '@mui/material/Box'

interface ImageBlockThumbnailProps {
  selectedBlock: { src: string | null; alt: string } | null
  loading: boolean
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
      {loading ? (
        <CircularProgress size={20} />
      ) : selectedBlock?.src != null ? (
        <Image
          src={selectedBlock.src}
          alt={selectedBlock.alt}
          layout="fill"
          objectFit="cover"
        />
      ) : (
        <ImageIcon data-testid="imageBlockThumbnailPlaceholder" />
      )}
    </Box>
  )
}
