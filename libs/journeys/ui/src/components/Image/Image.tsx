import { ReactElement } from 'react'
import NextImage from 'next/image'
import { TreeBlock } from '../..'
import { SxProps } from '@mui/system'
import { Theme, Box } from '@mui/material'
import { ImageFields } from './__generated__/ImageFields'

interface ImageProps extends TreeBlock<ImageFields> {
  sx?: SxProps<Theme>
}

export function Image({
  src,
  alt,
  height,
  width,
  sx
}: ImageProps): ReactElement {
  return (
    <Box
      sx={{
        borderRadius: (theme) => theme.spacing(4),
        overflow: 'hidden',
        mb: 4,
        ...sx,
        '> div': {
          display: 'block !important'
        }
      }}
    >
      <NextImage
        src={src}
        alt={alt}
        height={height}
        width={width}
        objectFit="cover"
      />
    </Box>
  )
}
