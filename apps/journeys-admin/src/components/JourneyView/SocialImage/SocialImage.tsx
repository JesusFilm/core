import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Image3 from '@core/shared/ui/icons/Image3'
import { NextImage } from '@core/shared/ui/NextImage'

export function SocialImage(): ReactElement {
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
          width={213}
          height={167}
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
            width: 213,
            height: 167,
            backgroundColor: 'background.default'
          }}
        >
          {journey != null ? <Image3 fontSize="large" /> : <></>}
        </Box>
      )}
    </Box>
  )
}
