import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { ComponentProps, ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

interface SocialImageProps {
  height?: ComponentProps<typeof Stack>['height']
  width?: ComponentProps<typeof Stack>['width']
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
      width={width}
      height={height}
      sx={{
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
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
