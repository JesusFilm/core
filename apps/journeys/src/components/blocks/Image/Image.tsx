import { ReactElement } from 'react'
import NextImage from 'next/image'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { SxProps } from '@mui/system'
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'

interface ImageProps extends TreeBlock<ImageBlock> {
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
