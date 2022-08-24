import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import Skeleton from '@mui/material/Skeleton'

export function SocialImage(): ReactElement {
  const { journey } = useJourney()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <>
      {journey?.primaryImageBlock?.src != null ? (
        <Box
          component="img"
          src={journey.primaryImageBlock.src}
          alt={journey.primaryImageBlock?.alt}
          style={{
            width: 213,
            height: 167,
            objectFit: 'cover',
            borderRadius: 12,
            marginRight: smUp ? 0 : 'auto',
            marginLeft: smUp ? 0 : 'auto'
          }}
        />
      ) : (
        <Skeleton
          variant="rectangular"
          style={{
            width: 213,
            height: 167,
            objectFit: 'cover',
            borderRadius: 12,
            marginRight: smUp ? 0 : 'auto',
            marginLeft: smUp ? 0 : 'auto'
          }}
        />
      )}
    </>
  )
}
