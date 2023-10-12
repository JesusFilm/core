import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

interface SocialImageProps {
  variant?: 'default' | 'large'
}

export function SocialImage({
  variant = 'default'
}: SocialImageProps): ReactElement {
  const { journey } = useJourney()

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {journey?.primaryImageBlock?.src != null ? (
        <NextImage
          src={journey.primaryImageBlock.src}
          alt={journey?.primaryImageBlock.alt}
          placeholder="blur"
          blurDataURL={journey?.primaryImageBlock.blurhash}
          width={variant === 'default' ? 213 : 244}
          height={variant === 'default' ? 167 : 244}
          objectFit="cover"
          style={{
            borderRadius: 12
          }}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 3,
            width: variant === 'default' ? 213 : 244,
            height: variant === 'default' ? 167 : { xs: 107, sm: 244 },
            backgroundColor: 'background.default'
          }}
        >
          {journey != null ? <GridEmptyIcon fontSize="large" /> : <></>}
        </Box>
      )}
    </Box>
  )
}
