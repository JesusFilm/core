import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import ImageIcon from '@mui/icons-material/Image'
import { Theme } from '@mui/material/styles'
import Skeleton from '@mui/material/Skeleton'

export function SocialImage(): ReactElement {
  const { journey } = useJourney()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <>
      {journey != null ? (
        journey.primaryImageBlock?.src != null ? (
          <Box
            component="img"
            src={journey.primaryImageBlock.src}
            alt={journey.primaryImageBlock?.alt}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 213,
              height: 167,
              objectFit: 'cover',
              borderRadius: 12,
              marginRight: smUp ? 0 : 'auto',
              marginLeft: smUp ? 0 : 'auto'
            }}
          />
        ) : (
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 12,
              width: 213,
              height: 167,
              backgroundColor: '#EFEFEF',
              marginRight: smUp ? 0 : 'auto',
              marginLeft: smUp ? 0 : 'auto'
            }}
          >
            <ImageIcon fontSize="large" />
          </Box>
        )
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
