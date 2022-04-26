import { ReactElement } from 'react'
import { NextImage } from '@core/shared/ui'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import { TreeBlock, blurImage } from '../..'
import { ImageFields } from './__generated__/ImageFields'

export function Image({
  id,
  src,
  alt,
  height,
  width,
  blurhash
}: TreeBlock<ImageFields>): ReactElement {
  const theme = useTheme()
  const placeholderSrc = blurImage(
    width,
    height,
    blurhash,
    theme.palette.background.paper
  )

  return (
    <Box
      data-testid={`image-${id}`}
      sx={{
        borderRadius: (theme) => theme.spacing(4),
        overflow: 'hidden',
        mb: 4
      }}
    >
      {src != null ? (
        <NextImage
          src={src}
          alt={alt}
          height={height}
          width={width}
          placeholder={'blur'}
          blurDataURL={placeholderSrc ?? src}
          layout="responsive"
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
