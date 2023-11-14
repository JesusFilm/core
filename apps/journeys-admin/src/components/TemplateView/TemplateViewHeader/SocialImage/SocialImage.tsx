import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

interface SocialImageProps {
  hasCreatorDescription?: boolean
}

export function SocialImage({
  hasCreatorDescription = false
}: SocialImageProps): ReactElement {
  const { journey } = useJourney()

  return (
    <Stack
      sx={{
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
        overflow: 'hidden',
        width: { xs: 107, sm: 244 },
        height: { xs: 107, sm: 244 },
        borderRadius: 3,
        borderBottomRightRadius: {
          xs: 12,
          sm: hasCreatorDescription ? 0 : 12
        },
        borderBottomLeftRadius: {
          xs: 12,
          sm: hasCreatorDescription ? 0 : 12
        }
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
