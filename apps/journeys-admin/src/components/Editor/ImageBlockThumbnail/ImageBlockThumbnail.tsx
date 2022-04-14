import { ReactElement } from 'react'
import ImageIcon from '@mui/icons-material/Image'
import Image from 'next/image'
import Box from '@mui/material/Box'

interface ImageBlockThumbnailProps {
  selectedBlock: { src: string | null; alt: string } | null
}

export function ImageBlockThumbnail({
  selectedBlock
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
      {selectedBlock?.src != null ? (
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
