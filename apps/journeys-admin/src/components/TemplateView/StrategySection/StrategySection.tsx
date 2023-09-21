import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

export function StrategySection(): ReactElement {
  const { t } = useTranslation()
  const { journey } = useJourney()

  const isCanvaLink = journey?.strategySlug.includes('canva') as boolean
  const embedURL = isCanvaLink
    ? journey?.strategySlug + '?embed'
    : journey?.strategySlug.replace('pub?start', 'embed?start')

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 7 }}>
        {t('Strategy')}
      </Typography>
      <Card sx={{ borderRadius: 5 }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 0,
            paddingTop: '56.2225%',
            paddingBottom: 0,
            overflow: 'hidden',
            willChange: 'transform'
          }}
        >
          <iframe
            loading="lazy"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              border: 'none',
              padding: 0,
              margin: 0
            }}
            src={embedURL}
            allowFullScreen
            allow="fullscreen"
          />
        </Box>
      </Card>
    </Box>
  )
}
