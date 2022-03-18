import { ReactElement } from 'react'
import NextImage from 'next/image'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import { TreeBlock } from '../..'
import { ImageFields } from './__generated__/ImageFields'

export function Image({
  id,
  src,
  alt,
  height,
  width
}: TreeBlock<ImageFields>): ReactElement {
  return (
    <Box
      data-testId={`image-${id}`}
      sx={{
        borderRadius: (theme) => theme.spacing(4),
        overflow: 'hidden',
        mb: 4,
        '> div:not(.MuiPaper-root)': {
          display: 'block !important'
        }
      }}
    >
      {src != null ? (
        <NextImage
          src={src}
          alt={alt}
          height={height}
          width={width}
          objectFit="cover"
        />
      ) : (
        <Paper
          sx={{
            borderRadius: (theme) => theme.spacing(4),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            fontSize: 100
          }}
          elevation={0}
          variant="outlined"
        >
          <ImageRoundedIcon fontSize="inherit" />
        </Paper>
      )}
    </Box>
  )
}
