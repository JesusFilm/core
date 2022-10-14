import { ReactElement, useMemo } from 'react'
import { NextImage } from '@core/shared/ui/NextImage'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import type { TreeBlock } from '../../libs/block'
import { blurImage } from '../../libs/blurImage'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
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
  const { journey } = useJourney()
  const placeholderSrc = useMemo(() => {
    return blurImage(blurhash, theme.palette.background.paper)
  }, [blurhash, theme])

  const rtl = getJourneyRTL(journey)

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
          placeholder="blur"
          blurDataURL={placeholderSrc ?? src}
          layout="responsive"
          objectFit="cover"
          style={{
            transform: rtl === true ? 'scaleX(-1)' : undefined
          }}
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
