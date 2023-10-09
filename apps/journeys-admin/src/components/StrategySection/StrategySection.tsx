import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Presentation1 from '@core/shared/ui/icons/Presentation1'

interface StrategySectionProps {
  strategySlug?: string | null
  variant: 'placeholder' | 'full'
  isError?: boolean
}

export function StrategySection({
  strategySlug,
  variant,
  isError = false
}: StrategySectionProps): ReactElement {
  const { t } = useTranslation()

  const [embedURL, setEmbedURL] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (strategySlug != null) {
      const isCanvaLink = strategySlug?.includes('canva')
      setEmbedURL(
        isCanvaLink
          ? strategySlug + '?embed'
          : strategySlug.replace('pub?start', 'embed?start')
      )
    }
  }, [strategySlug, isError])

  const renderEmbed = !isError && embedURL !== ''

  return (
    <>
      {variant === 'full' && (
        <Typography variant="h5" sx={{ mb: 7 }}>
          {t('Strategy')}
        </Typography>
      )}
      <Card
        sx={{
          borderRadius: 5,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {renderEmbed || variant === 'full' ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              // recommended padding from canva for proper aspect ratio do not round up/down.
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
        ) : (
          <Stack
            data-testid="case-study-preview-placeholder"
            sx={{
              width: '100%',
              py: 'calc(28.11125% - 24px)',
              border: 'none',
              display: 'flex',
              direction: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Presentation1 sx={{ color: 'secondary.light' }} />
            <Typography sx={{ color: 'secondary.light' }}>
              {t('Case Study Preview')}
            </Typography>
          </Stack>
        )}
      </Card>
    </>
  )
}
