import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import ImageIcon from '@mui/icons-material/Image'
import Skeleton from '@mui/material/Skeleton'

export function SocialImage(): ReactElement {
  const { journey } = useJourney()

  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {journey != null ? (
        journey.primaryImageBlock?.src != null ? (
          <Box
            component="img"
            src={journey.primaryImageBlock.src}
            alt={journey.primaryImageBlock?.alt}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 3,
              width: 213,
              height: 167,
              objectFit: 'cover'
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
            <ImageIcon fontSize="large" />
          </Box>
        )
      ) : (
        <Skeleton
          variant="rectangular"
          sx={{
            width: 213,
            height: 167,
            objectFit: 'cover',
            borderRadius: 3
          }}
        />
      )}
    </Box>
  )
}
