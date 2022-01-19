import { ReactElement } from 'react'
import NextImage from 'next/image'
import { SxProps } from '@mui/system/styleFunctionSx'
import { Theme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { TreeBlock } from '../..'
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
        src={
          src != null ? src : `${window.location.origin}/DefaultImageIcon.png`
        }
        alt={alt}
        height={height}
        width={width}
        objectFit="cover"
      />
    </Box>
  )
}
