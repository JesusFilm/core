import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

interface SocialScreenSocialImage {
  hasCreatorDescription?: boolean
}

const WIDE_ASPECT_RATIO = {
  width: { xs: 223, sm: 278 },
  height: { xs: 139, sm: 194 }
}

export function SocialScreenSocialImage({
  hasCreatorDescription = false
}: SocialScreenSocialImage): ReactElement {
  const { journey } = useJourney()

  return (
    <Stack
      sx={{
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: journey != null ? 'background.default' : 'transparent',
        overflow: 'hidden',
        borderRadius: 3,
        borderBottomRightRadius: {
          xs: 12,
          sm: hasCreatorDescription ? 0 : 12
        },
        borderBottomLeftRadius: {
          xs: 12,
          sm: hasCreatorDescription ? 0 : 12
        },
        ...WIDE_ASPECT_RATIO
      }}
      data-testid="SocialScreenSocialImage"
    >
      {journey?.primaryImageBlock?.src != null ? (
        <NextImage
          src={journey.primaryImageBlock.src}
          alt={journey?.primaryImageBlock.alt}
          placeholder="blur"
          blurDataURL={journey?.primaryImageBlock.blurhash}
          layout="fill"
          objectFit="cover"
          priority
        />
      ) : journey != null ? (
        <GridEmptyIcon fontSize="large" />
      ) : (
        <Skeleton
          data-testid="SocialScreenSocialImageSkeleton"
          variant="rectangular"
          sx={{
            width: '100%',
            height: '100%'
          }}
        />
      )}
    </Stack>
  )
}
