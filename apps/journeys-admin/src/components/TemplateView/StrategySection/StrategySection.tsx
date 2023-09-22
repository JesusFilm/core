import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

interface StrategySectionProps {
  strategySlug: string
}

export function StrategySection({
  strategySlug
}: StrategySectionProps): ReactElement {
  const { t } = useTranslation()

  const isCanvaLink = strategySlug.includes('canva')
  const embedURL = isCanvaLink
    ? strategySlug + '?embed'
    : strategySlug.replace('pub?start', 'embed?start')

  return (
    <Stack>
      <Typography variant="h5" sx={{ mb: 7 }}>
        {t('Strategy')}
      </Typography>
      <Card sx={{ borderRadius: 5 }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            // recommended padding from canva for proper aspect ratio
            paddingTop: '56.2225%',
            paddingBottom: 0,
            overflow: 'hidden',
            willChange: 'transform'
          }}
        >
          <iframe
            loading="lazy"
            data-testid="strategy-iframe"
            onLoad={(event) =>
              ((event.target as HTMLIFrameElement).style.opacity = '1')
            }
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0,
              transition: '.3s ease-in opacity',
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
    </Stack>
  )
}
