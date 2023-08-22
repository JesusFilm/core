import ImageIcon from '@mui/icons-material/Image'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
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
          style={{
            objectFit: 'cover',
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
          {journey != null ? <ImageIcon fontSize="large" /> : <></>}
        </Box>
      )}
    </Box>
  )
}
