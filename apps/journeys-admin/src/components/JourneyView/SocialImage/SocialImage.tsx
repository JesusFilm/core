import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import { SxProps } from '@mui/material/styles'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

interface SocialImageProps {
  height?: number
  width?: number
  sx?: SxProps
}

export function SocialImage({
  height = 167,
  width = 213,
  sx
}: SocialImageProps): ReactElement {
  const { journey } = useJourney()

  return (
    <Stack
      sx={{
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        width,
        height,
        backgroundColor: 'background.default',
        overflow: 'hidden',
        ...sx
      }}
    >
      {journey?.primaryImageBlock?.src != null ? (
        <NextImage
          src={journey.primaryImageBlock.src}
          alt={journey?.primaryImageBlock.alt}
          placeholder="blur"
          blurDataURL={journey?.primaryImageBlock.blurhash}
          layout="fill"
          objectFit="cover"
        />
      ) : journey != null ? (
        <GridEmptyIcon fontSize="large" />
      ) : (
        <Skeleton
          data-testid="SocialImageSkeleton"
          variant="rectangular"
          sx={{ width: '100%', height: '100%' }}
        />
      )}
    </Stack>
  )
}
