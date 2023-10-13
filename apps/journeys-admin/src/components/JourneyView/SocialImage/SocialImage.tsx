import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

interface SocialImageProps {
  height?: number
  width?: number
}

export function SocialImage({
  height = 213,
  width = 167
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
          width={width}
          height={height}
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
            width,
            height,
            backgroundColor: 'background.default'
          }}
        >
          {journey != null ? <GridEmptyIcon fontSize="large" /> : <></>}
        </Box>
      )}
    </Box>
  )
}
