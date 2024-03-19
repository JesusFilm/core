import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps, useTheme } from '@mui/material/styles'
import { ReactElement, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useBlocks } from '@core/journeys/ui/block'
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

import { DynamicCardList } from './DynamicCardList'
import { NavigationButton } from './NavigationButton'
import { SwipeNavigation } from './SwipeNavigation'

export const JOURNEY_VIEW_EVENT_CREATE = gql`
  mutation JourneyViewEventCreate($input: JourneyViewEventCreateInput!) {
    journeyViewEventCreate(input: $input) {
      id
    }
  }
`

export const JOURNEY_VISITOR_UPDATE = gql`
  mutation VisitorUpdateForCurrentUser($input: VisitorUpdateInput!) {
    visitorUpdateForCurrentUser(input: $input) {
      id
    }
  }
`
interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, blockHistory, showHeaderFooter } = useBlocks()
  const theme = useTheme()
  const { journey, variant } = useJourney()
  const { locale, rtl } = getJourneyRTL(journey)
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

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

  useEffect(() => {
    setTreeBlocks(blocks)
  }, [setTreeBlocks, blocks])

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

  const stepTheme = getStepTheme(activeBlock, journey)

  return (
    <ThemeProvider
      themeName={ThemeName.journeyUi}
      themeMode={stepTheme.themeMode}
      locale={locale}
      rtl={rtl}
      nested
    >
      <Stack
        data-testid="Conductor"
        sx={{
          justifyContent: 'center',
          height: '100svh',
          background: theme.palette.grey[900],
          overflow: 'hidden'
        }}
      >
        <Box sx={{ height: { xs: '100%', lg: 'unset' } }}>
          <Stack
            sx={{
              maxHeight: {
                xs: '100svh',
                // 80px to allow for the gap between card and top/bottom of the viewport
                lg: 'calc(100svh - 80px)'
              },
              height: {
                xs: 'inherit',
                // 102px to allow for the gap between card and top/bottom of the viewport
                lg: 'calc(54.25vw + 102px)'
              },
              px: { lg: 6 }
            }}
          >
            <StepHeader
              sx={{
                ...mobileNotchStyling,
                display: {
                  xs: showHeaderFooter ? 'flex' : 'none',
                  lg: 'flex'
                }
              }}
            />
            <ThemeProvider {...stepTheme} locale={locale} rtl={rtl} nested>
              <SwipeNavigation activeBlock={activeBlock} rtl={rtl}>
                <DynamicCardList />
              </SwipeNavigation>
            </ThemeProvider>
            <NavigationButton
              variant={rtl ? 'next' : 'previous'}
              alignment="left"
            />
            <NavigationButton
              variant={rtl ? 'previous' : 'next'}
              alignment="right"
            />
            <StepFooter
              sx={{
                ...mobileNotchStyling,
                display: {
                  xs: showHeaderFooter ? 'flex' : 'none',
                  lg: 'flex'
                }
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </ThemeProvider>
  )
}
