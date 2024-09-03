import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { SxProps, useTheme } from '@mui/material/styles'
import { ReactElement, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName } from '@core/shared/ui/themes'

import { VisitorUpdateInput } from '../../../__generated__/globalTypes'
import { JourneyViewEventCreate } from '../../../__generated__/JourneyViewEventCreate'
import { StepFields } from '../../../__generated__/StepFields'
import {
  JOURNEY_VIEW_EVENT_CREATE,
  JOURNEY_VISITOR_UPDATE
} from '../Conductor/Conductor'

interface WebViewProps {
  stepBlock: TreeBlock<StepFields>
}
export function WebView({ stepBlock }: WebViewProps): ReactElement {
  const { journey, variant } = useJourney()
  const { locale, rtl } = getJourneyRTL(journey)
  const theme = useTheme()

  const [journeyViewEventCreate] = useMutation<JourneyViewEventCreate>(
    JOURNEY_VIEW_EVENT_CREATE
  )

  const [journeyVisitorUpdate] = useMutation<VisitorUpdateInput>(
    JOURNEY_VISITOR_UPDATE
  )

  useEffect(() => {
    if ((variant === 'default' || variant === 'embed') && journey != null) {
      const id = uuidv4()
      void journeyViewEventCreate({
        variables: {
          input: {
            id,
            journeyId: journey.id,
            label: journey.title,
            value: journey.language.id
          }
        }
      }).then(() => {
        void fetch('/api/geolocation').then((response) => {
          void response
            .json()
            .then(
              (data: { city?: string; country?: string; region?: string }) => {
                const countryCodes: string[] = []
                if (data.city != null) countryCodes.push(decodeURI(data.city))
                if (data.region != null) countryCodes.push(data.region)
                if (data.country != null) countryCodes.push(data.country)

                if (countryCodes.length > 0 || document.referrer !== '') {
                  void journeyVisitorUpdate({
                    variables: {
                      input: {
                        countryCode:
                          countryCodes.length > 0
                            ? countryCodes.join(', ')
                            : undefined,
                        referrer:
                          document.referrer !== ''
                            ? document.referrer
                            : undefined
                      }
                    }
                  })
                }
              }
            )
        })
      })
      TagManager.dataLayer({
        dataLayer: {
          event: 'journey_view',
          journeyId: journey.id,
          eventId: id,
          journeyTitle: journey.title
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey])

  const mobileNotchStyling: SxProps = {
    width: {
      xs:
        variant === 'default' || variant === 'embed'
          ? 'calc(100% - env(safe-area-inset-left) - env(safe-area-inset-right))'
          : '100%',
      lg: 'auto'
    },
    left:
      variant === 'default' || variant === 'embed'
        ? 'env(safe-area-inset-left)'
        : undefined,
    right:
      variant === 'default' || variant === 'embed'
        ? 'env(safe-area-inset-right)'
        : undefined
  }

  const stepTheme = getStepTheme(stepBlock, journey)

  const STEP_HEADER_HEIGHT = '44px'
  const STEP_FOOTER_HEIGHT = '68px'

  return (
    <ThemeProvider
      themeName={ThemeName.journeyUi}
      themeMode={stepTheme.themeMode}
      locale={locale}
      rtl={rtl}
      nested
    >
      <Container
        data-testid="WebView"
        maxWidth="xxl"
        disableGutters
        sx={{
          justifyContent: 'center',
          height: '100svh',
          background: theme.palette.grey[900]
        }}
      >
        <StepHeader
          sx={{
            ...mobileNotchStyling,
            display: 'flex',
            px: { lg: 8 }
          }}
        />
        <ThemeProvider {...stepTheme} locale={locale} rtl={rtl} nested>
          <Box
            sx={{
              height: '100%',
              marginTop: { lg: `-${STEP_HEADER_HEIGHT}` },
              marginBottom: { lg: `-${STEP_FOOTER_HEIGHT}` }
            }}
          >
            <BlockRenderer block={stepBlock} />
          </Box>
        </ThemeProvider>
        <StepFooter
          sx={{
            ...mobileNotchStyling,
            display: 'flex',
            px: { lg: 8 }
          }}
        />
      </Container>
    </ThemeProvider>
  )
}
