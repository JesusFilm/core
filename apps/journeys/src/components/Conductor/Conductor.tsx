import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps, useTheme } from '@mui/material/styles'
import { sendGTMEvent } from '@next/third-parties/google'
import { ReactElement, useEffect } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  blockHistoryVar,
  getCardChild,
  useBlocks
} from '@core/journeys/ui/block'
import { hasAiChatButton } from '@core/journeys/ui/Card/utils/getFooterElements'
import { useChatOverlay } from '@core/journeys/ui/ChatOverlayProvider'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { PinnedChatBar } from '@core/journeys/ui/PinnedChatBar'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { FontFamilies, ThemeName } from '@core/shared/ui/themes'

import { VisitorUpdateInput } from '../../../__generated__/globalTypes'
import { JourneyViewEventCreate } from '../../../__generated__/JourneyViewEventCreate'
import { StepFields } from '../../../__generated__/StepFields'

import { DynamicCardList } from './DynamicCardList'
import { HotkeyNavigation } from './HotkeyNavigation'
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
  const flags = useFlags()
  const apologistChatEnabled = flags.apologistChat === true

  // Create font family strings based on journey theme
  const fontFamilies: FontFamilies = {
    headerFont: journey?.journeyTheme?.headerFont ?? '',
    bodyFont: journey?.journeyTheme?.bodyFont ?? '',
    labelFont: journey?.journeyTheme?.labelFont ?? ''
  }

  useEffect(() => {
    blockHistoryVar([blocks[0]])
    setTreeBlocks(blocks)
    // multiple re-renders causes block history to be incorrect so do not pass in 'blocks' variable to deps array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTreeBlocks, journey?.id])

  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  const activeCard = getCardChild(activeBlock)

  const showPinnedChat =
    apologistChatEnabled &&
    hasAiChatButton({ journey, variant, card: activeCard })

  // Mobile: per-card `expandChatByDefault === true` lands the bar in
  // `'idle'` (header + input visible, ready). Otherwise the bar starts
  // `'collapsed'` (drag handle only) so creators who haven't opted in
  // do not get the chat surface eating screen real estate. Sticky after
  // mount — drag interactions own the state from there. So on mobile,
  // `expandChatByDefault` only seeds the first card a visitor lands on;
  // subsequent card navigations preserve whatever sheet state the user
  // (or the previous card's seed) produced. Mobile per-card re-seeding
  // is tracked as follow-up work.
  const initialChatExpanded = activeCard?.expandChatByDefault === true

  const { setOpen, shouldAutoOpen, markAutoOpened } = useChatOverlay()

  // Desktop overlay auto-open on `expandChatByDefault`. Lives at the
  // navigation chokepoint so prefetched neighbours mounted off-screen by
  // DynamicCardList do not trigger it. Mobile is handled separately via
  // `initialChatExpanded` → `<PinnedChatBar initialExpanded=…>` (declared
  // above); `setOpen` here only drives the desktop overlay. After mount
  // the pinned bar's local state machine owns mobile sheet state.
  //
  // Deps include `apologistChatEnabled` so a late-arriving LD flag still
  // triggers the auto-open after activeBlock has settled (the original
  // `[activeBlock?.id]` dep set silently lost this race when LD finished
  // loading after the first card was active). `setOpen` /
  // `shouldAutoOpen` / `markAutoOpened` are stable callbacks from the
  // provider — depending on them is cheap and keeps the lint happy
  // without re-firing on every overlay open/close. `journey` is no
  // longer in deps: `hasAiChatButton` is purely card-level since
  // NES-1622 dropped the `Journey.showAssistant` fallback, so depending
  // on the whole `journey` reference would re-fire on every Apollo
  // cache write (analytics mutations, language updates, …) for no
  // signal. Re-firing on the remaining deps is safe: `shouldAutoOpen`
  // dedups on (journeyId, cardId) via sessionStorage, so a manual
  // dismiss is not overridden by a later re-evaluation in the same tab.
  useEffect(() => {
    if (!apologistChatEnabled) return
    if (activeCard == null || activeCard.expandChatByDefault !== true) return
    if (!hasAiChatButton({ journey, variant, card: activeCard })) return
    if (!shouldAutoOpen(activeCard.id)) return
    markAutoOpened(activeCard.id)
    setOpen(true)
    // `journey` intentionally omitted — see comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeCard?.id,
    apologistChatEnabled,
    variant,
    setOpen,
    shouldAutoOpen,
    markAutoOpened
  ])

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
      sendGTMEvent({
        event: 'journey_view',
        journeyId: journey.id,
        eventId: id,
        journeyTitle: journey.title
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

  const stepTheme = getStepTheme(activeBlock, journey)

  return (
    <HotkeysProvider>
      <HotkeyNavigation rtl={rtl} />
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
            height: '100dvh',
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
              <ThemeProvider
                {...stepTheme}
                locale={locale}
                rtl={rtl}
                fontFamilies={fontFamilies}
                nested
              >
                <SwipeNavigation activeBlock={activeBlock} rtl={rtl}>
                  <DynamicCardList blocks={blocks} />
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
              {showPinnedChat ? (
                <PinnedChatBar
                  initialExpanded={initialChatExpanded}
                  sx={{
                    ...mobileNotchStyling,
                    display: {
                      xs: showHeaderFooter ? 'flex' : 'none',
                      sm: 'none'
                    }
                  }}
                />
              ) : (
                <StepFooter
                  selectedStep={activeBlock}
                  sx={{
                    ...mobileNotchStyling,
                    display: {
                      xs: showHeaderFooter ? 'flex' : 'none',
                      lg: 'flex'
                    }
                  }}
                />
              )}
              {/* On sm+, show StepFooter (with AiChatButton → ChatOverlay) when pinned chat is active on mobile */}
              {showPinnedChat && (
                <StepFooter
                  selectedStep={activeBlock}
                  sx={{
                    ...mobileNotchStyling,
                    display: {
                      xs: 'none',
                      sm: 'flex'
                    }
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </ThemeProvider>
    </HotkeysProvider>
  )
}
