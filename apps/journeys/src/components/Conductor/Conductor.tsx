import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useRef } from 'react'
import { use100vh } from 'react-div-100vh'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  nextActiveBlock,
  previousActiveBlock,
  useBlocks
} from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { VisitorUpdateInput } from '../../../__generated__/globalTypes'
import { JourneyViewEventCreate } from '../../../__generated__/JourneyViewEventCreate'
import { StepFields } from '../../../__generated__/StepFields'

import { NavigationButton } from './NavigationButton'

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
  const viewportHeight = use100vh()
  const router = useRouter()
  const { journey, variant } = useJourney()
  const { locale, rtl } = getJourneyRTL(journey)
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>
  const stepTheme = getStepTheme(activeBlock, journey)

  const [journeyViewEventCreate] = useMutation<JourneyViewEventCreate>(
    JOURNEY_VIEW_EVENT_CREATE
  )

  const [journeyVisitorUpdate] = useMutation<VisitorUpdateInput>(
    JOURNEY_VISITOR_UPDATE
  )

  const enableTouchMoveNext = !activeBlock?.locked ?? false

  useEffect(() => {
    let touchstartX = 0
    let touchendX = 0

    function checkDirection(): void {
      if (touchendX + 50 < touchstartX && enableTouchMoveNext) nextActiveBlock()
      if (touchendX - 50 > touchstartX) previousActiveBlock()
    }

    function touchStart(e): void {
      touchstartX = e.changedTouches[0].screenX
    }

    function touchEnd(e): void {
      touchendX = e.changedTouches[0].screenX
      checkDirection()
    }

    document.addEventListener('touchstart', touchStart)
    document.addEventListener('touchend', touchEnd)

    return () => {
      document.removeEventListener('touchstart', touchStart)
      document.removeEventListener('touchend', touchEnd)
    }
  }, [activeBlock, enableTouchMoveNext])

  // ScrollBlock: https:// gist.github.com/reecelucas/2f510e6b8504008deaaa52732202d2da
  // const scroll = useRef(false)
  // if (typeof document !== 'undefined') {
  //   const html = document.documentElement
  //   const body = document.body

  //   if (body != null || !scroll.current) {
  //     const scrollBarWidth = window.innerWidth - html.clientWidth
  //     const bodyPaddingRight =
  //       parseInt(
  //         window.getComputedStyle(body).getPropertyValue('padding-right')
  //       ) ?? 0

  //     html.style.position = 'relative' /* [1] */
  //     body.style.position = 'relative' /* [1] */
  //     html.style.overflow = 'hidden' /* [2] */
  //     body.style.overflow = 'hidden' /* [2] */
  //     body.style.paddingRight = `${bodyPaddingRight + scrollBarWidth}px`

  //     scroll.current = true
  //   }
  // }

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
        variant === 'default'
          ? 'calc(100% - env(safe-area-inset-left) - env(safe-area-inset-right))'
          : '100%',
      lg: 'auto'
    },
    left: variant === 'default' ? 'env(safe-area-inset-left)' : undefined,
    right: variant === 'default' ? 'env(safe-area-inset-right)' : undefined
  }

  return (
    <Box
      sx={{
        height: viewportHeight ?? '100vh',
        minHeight: '-webkit-fill-available',
        [theme.breakpoints.down('md')]: { overflowY: 'auto' },
        overflow: 'hidden'
      }}
    >
      <Stack
        sx={{
          justifyContent: 'center',
          height: '100%',
          background: theme.palette.grey[900]
        }}
        data-testid="Conductor"
      >
        <Box sx={{ height: { xs: '100%', lg: 'unset' } }}>
          <ThemeProvider {...stepTheme} locale={locale} rtl={rtl} nested>
            <Stack
              justifyContent="center"
              sx={{
                maxHeight: {
                  xs: '100vh',
                  lg: 'calc(100vh - 80px)'
                },
                height: {
                  xs: 'inherit',
                  lg: 'calc(54.25vw + 102px)'
                },
                px: { lg: 6 }
              }}
            >
              <Stack
                sx={{
                  position: 'absolute',
                  mt: 1,
                  lg: 0,
                  zIndex: 10,
                  top: 1,
                  left: 1,
                  backgroundColor: 'rgba(76, 175, 80, 0.3)'
                }}
              >
                <Typography color="secondary">
                  {`Unlocked: ${!activeBlock?.locked ? 'true' : 'false'}`}
                </Typography>
                <Typography color="secondary">
                  {`Enable touch move: ${
                    enableTouchMoveNext ? 'true' : 'false'
                  }`}
                </Typography>
              </Stack>
              {showHeaderFooter && router.query.noi == null && (
                <StepHeader sx={{ ...mobileNotchStyling }} />
              )}

              <BlockRenderer block={activeBlock} />

              <StepFooter
                sx={{
                  visibility: showHeaderFooter ? 'visible' : 'hidden',
                  ...mobileNotchStyling
                }}
              />
            </Stack>
          </ThemeProvider>

          <NavigationButton
            variant={rtl ? 'next' : 'previous'}
            alignment="left"
          />
          <NavigationButton
            variant={rtl ? 'previous' : 'next'}
            alignment="right"
          />
        </Box>
      </Stack>
    </Box>
  )
}
