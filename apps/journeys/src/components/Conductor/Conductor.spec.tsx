import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { v4 as uuidv4 } from 'uuid'
import { type Mock, type MockedFunction } from 'vitest'

import {
  TreeBlock,
  blockHistoryVar,
  treeBlocksVar
} from '@core/journeys/ui/block'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREVIOUS_EVENT_CREATE
} from '@core/journeys/ui/Card/Card'
import { ChatOverlayProvider } from '@core/journeys/ui/ChatOverlayProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { STEP_VIEW_EVENT_CREATE } from '@core/journeys/ui/Step/Step'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_language as Language
} from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { basic } from '../../libs/testData/storyData'

import { JOURNEY_VIEW_EVENT_CREATE, JOURNEY_VISITOR_UPDATE } from './Conductor'

import { Conductor } from '.'

vi.mock('@core/shared/ui/useBreakpoints', () => ({
  __esModule: true,
  useBreakpoints: vi.fn()
}))

vi.mock('uuid', () => ({
  __esModule: true,
  v4: vi.fn()
}))

const mockUuidv4 = uuidv4 as unknown as MockedFunction<typeof uuidv4>

vi.mock('@next/third-parties/google', () => ({
  sendGTMEvent: vi.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as unknown as MockedFunction<
  typeof sendGTMEvent
>

global.fetch = vi.fn(
  async () =>
    await Promise.resolve({
      json: async () =>
        await Promise.resolve({
          city: 'Blenheim',
          region: 'Marlborough',
          country: 'New Zealand'
        })
    })
) as Mock

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

// The drawer reads its open state straight from ChatOverlayProvider —
// Conductor only decides whether it is mounted, so a bare stub suffices.
// Harmless to the non-chat tests above: they render without the
// apologistChat flag, so `showPinnedChat` is false and the bar never mounts.
vi.mock('@core/journeys/ui/PinnedChatBar', () => ({
  __esModule: true,
  PinnedChatBar: () => <div data-testid="PinnedChatBar" />
}))

// Replace ChatOverlay with a tiny renderer that exposes `open` so the
// auto-open tests can assert the effect drove `setOpen(true)` through the
// real ChatOverlayProvider → AiChatButton wiring.
vi.mock('@core/journeys/ui/ChatOverlay', () => ({
  __esModule: true,
  ChatOverlay: ({ open }: { open: boolean }) =>
    open ? <div data-testid="ChatOverlay-open" /> : null
}))

const noopJourneyViewMock: MockedResponse = {
  request: { query: JOURNEY_VIEW_EVENT_CREATE },
  variableMatcher: () => true,
  maxUsageCount: Infinity,
  delay: 99999999,
  result: {
    data: {
      journeyViewEventCreate: { id: 'noop', __typename: 'JourneyViewEvent' }
    }
  }
}

const noopStepViewMock: MockedResponse = {
  request: { query: STEP_VIEW_EVENT_CREATE },
  variableMatcher: () => true,
  maxUsageCount: Infinity,
  result: {
    data: {
      stepViewEventCreate: { id: 'noop', __typename: 'StepViewEvent' }
    }
  }
}

const noopStepNextMock: MockedResponse = {
  request: { query: STEP_NEXT_EVENT_CREATE },
  variableMatcher: () => true,
  maxUsageCount: Infinity,
  result: {
    data: {
      stepNextEventCreate: { id: 'noop', __typename: 'StepNextEvent' }
    }
  }
}

const noopStepPreviousMock: MockedResponse = {
  request: { query: STEP_PREVIOUS_EVENT_CREATE },
  variableMatcher: () => true,
  maxUsageCount: Infinity,
  result: {
    data: {
      stepPreviousEventCreate: {
        id: 'noop',
        __typename: 'StepPreviousEvent'
      }
    }
  }
}

const sideEffectMocks = [
  noopJourneyViewMock,
  noopStepViewMock,
  noopStepNextMock,
  noopStepPreviousMock
]

describe('Conductor', () => {
  beforeEach(() => {
    const useBreakpointsMock = useBreakpoints as Mock
    useBreakpointsMock.mockReturnValue({
      xs: false,
      sm: false,
      md: false,
      lg: false,
      xl: true
    })
  })

  const rtlLanguage: Language = {
    __typename: 'Language',
    id: '529',
    bcp47: 'ar',
    iso3: 'arb',
    name: [
      {
        __typename: 'LanguageName',
        value: 'Arabic',
        primary: false
      }
    ]
  }

  const visitorUpdateMock = {
    request: {
      query: JOURNEY_VISITOR_UPDATE,
      variables: {
        input: {
          countryCode: 'Blenheim, Marlborough, New Zealand',
          referrer: undefined
        }
      }
    },
    result: {
      data: {
        visitorUpdateForCurrentUser: { id: 'uuid', __typename: 'Visitor' }
      }
    }
  }

  const defaultJourney: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    featuredAt: null,
    title: 'my journey',
    strategySlug: null,
    slug: 'my-journey',
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'LanguageName',
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    updatedAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [],
    primaryImageBlock: null,
    creatorDescription: null,
    creatorImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: null,
    seoDescription: null,
    chatButtons: [],
    host: null,
    team: null,
    tags: [],
    website: null,
    showShareButton: null,
    showLikeButton: null,
    showDislikeButton: null,
    displayTitle: null,
    logoImageBlock: null,
    menuButtonIcon: null,
    menuStepBlock: null,
    journeyTheme: null,
    journeyCustomizationDescription: null,
    journeyCustomizationFields: [],
    fromTemplateId: null,
    socialNodeX: null,
    socialNodeY: null,
    customizable: null,
    showAssistant: null
  }

  it('should create a journeyViewEvent', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')

    const result = vi.fn(() => ({
      data: {
        journeyViewEventCreate: {
          id: 'uuid',
          __typename: 'JourneyViewEvent'
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_VIEW_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  label: 'my journey',
                  value: '529'
                }
              }
            },
            result
          },
          visitorUpdateMock
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <Conductor blocks={[]} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should add journeyViewEvent to dataLayer', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_VIEW_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  label: 'my journey',
                  value: '529'
                }
              }
            },
            result: {
              data: {
                journeyViewEventCreate: {
                  id: 'uuid',
                  __typename: 'JourneyViewEvent'
                }
              }
            }
          },
          visitorUpdateMock
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <Conductor blocks={[]} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'journey_view',
        journeyId: 'journeyId',
        eventId: 'uuid',
        journeyTitle: 'my journey'
      })
    )
  })

  it('should sets block history to first block when blocks change', () => {
    const blocks: TreeBlock[] = []
    render(
      <MockedProvider mocks={[...sideEffectMocks]}>
        <SnackbarProvider>
          <Conductor blocks={blocks} />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(treeBlocksVar()).toBe(blocks)
    expect(blockHistoryVar()).toStrictEqual([blocks[0]])
  })

  describe('ltr journey', () => {
    it('should navigate back and forth', () => {
      const { getByTestId } = render(
        <MockedProvider mocks={[...sideEffectMocks]}>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: defaultJourney }}>
              <Conductor blocks={basic} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      const leftButton = getByTestId('ConductorNavigationButtonPrevious')
      const rightButton = getByTestId('ConductorNavigationButtonNext')

      expect(treeBlocksVar()).toBe(basic)
      expect(blockHistoryVar()[0].id).toBe('step1.id')
      expect(rightButton).toBeVisible()
      expect(rightButton).toHaveStyle('cursor: pointer;')

      fireEvent.click(rightButton)

      expect(blockHistoryVar()).toHaveLength(2)
      expect(blockHistoryVar()[1].id).toBe('step2.id')
      expect(leftButton).toBeVisible()

      fireEvent.click(leftButton)

      expect(blockHistoryVar()).toHaveLength(1)
      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })
  })

  describe('rtl journey', () => {
    it('should navigate back and forth', () => {
      const { getByTestId } = render(
        <MockedProvider mocks={[...sideEffectMocks]}>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: { ...defaultJourney, language: rtlLanguage } }}
            >
              <Conductor blocks={basic} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      const leftButton = getByTestId('ConductorNavigationButtonNext')
      const rightButton = getByTestId('ConductorNavigationButtonPrevious')

      expect(treeBlocksVar()).toBe(basic)
      expect(blockHistoryVar()[0].id).toBe('step1.id')
      expect(leftButton).toBeVisible()
      expect(leftButton).toHaveStyle('cursor: pointer;')

      fireEvent.click(leftButton)

      expect(blockHistoryVar()).toHaveLength(2)
      expect(blockHistoryVar()[1].id).toBe('step2.id')
      expect(rightButton).toBeVisible()

      fireEvent.click(rightButton)

      expect(blockHistoryVar()).toHaveLength(1)
      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })
  })

  describe('per-card chat', () => {
    // These tests use `variant: 'customize'`, so Conductor's journeyView
    // effect early-returns and never calls `global.fetch` — the module-level
    // geo-data fetch above is irrelevant here.
    const perCardJourney: Journey = { ...defaultJourney }

    interface CardOverrides {
      showAssistant: boolean | null
      expandChatByDefault: boolean | null
    }

    function buildBlocks({
      showAssistant,
      expandChatByDefault
    }: CardOverrides): TreeBlock[] {
      return [
        {
          id: 'step1.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: [
            {
              id: 'card1.id',
              __typename: 'CardBlock',
              parentBlockId: 'step1.id',
              parentOrder: 0,
              coverBlockId: null,
              backgroundColor: null,
              backdropBlur: null,
              themeMode: null,
              themeName: null,
              fullscreen: false,
              eventLabel: null,
              children: [],
              showAssistant,
              expandChatByDefault
            }
          ]
        }
      ]
    }

    function renderConductor({
      journey,
      blocks,
      apologistChat = true
    }: {
      journey: Journey
      blocks: TreeBlock[]
      apologistChat?: boolean
    }) {
      return render(
        <FlagsProvider flags={{ apologistChat }}>
          <MockedProvider mocks={[]}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey, variant: 'customize' }}>
                <ChatOverlayProvider journeyId={journey.id}>
                  <Conductor blocks={blocks} />
                </ChatOverlayProvider>
              </JourneyProvider>
            </SnackbarProvider>
          </MockedProvider>
        </FlagsProvider>
      )
    }

    beforeEach(() => {
      blockHistoryVar([])
      window.sessionStorage.clear()
    })

    describe('per-card showAssistant', () => {
      it('renders PinnedChatBar when card.showAssistant is true and journey.showAssistant is null', async () => {
        const { findByTestId } = renderConductor({
          journey: { ...perCardJourney, showAssistant: null },
          blocks: buildBlocks({
            showAssistant: true,
            expandChatByDefault: null
          })
        })
        expect(await findByTestId('PinnedChatBar')).toBeInTheDocument()
      })

      it('hides PinnedChatBar when card.showAssistant is false even if journey.showAssistant is true (per-card opt-out wins)', async () => {
        const { queryByTestId, findByTestId } = renderConductor({
          journey: { ...perCardJourney, showAssistant: true },
          blocks: buildBlocks({
            showAssistant: false,
            expandChatByDefault: null
          })
        })
        // Wait for the activeBlock-driven re-render so the verdict is stable.
        await findByTestId('Conductor')
        expect(queryByTestId('PinnedChatBar')).not.toBeInTheDocument()
      })

      it('does not fall back to journey.showAssistant when card.showAssistant is null', async () => {
        const { findByTestId, queryByTestId } = renderConductor({
          journey: { ...perCardJourney, showAssistant: true },
          blocks: buildBlocks({
            showAssistant: null,
            expandChatByDefault: null
          })
        })
        // Wait for the activeBlock-driven re-render so the verdict is stable.
        await findByTestId('Conductor')
        expect(queryByTestId('PinnedChatBar')).not.toBeInTheDocument()
      })
    })

    describe('expandChatByDefault auto-open', () => {
      it('opens the desktop ChatOverlay on initial mount when card.expandChatByDefault is true', async () => {
        const { findByTestId } = renderConductor({
          journey: { ...perCardJourney, showAssistant: null },
          blocks: buildBlocks({
            showAssistant: true,
            expandChatByDefault: true
          })
        })
        expect(await findByTestId('ChatOverlay-open')).toBeInTheDocument()
      })

      it('auto-opens the overlay when card.expandChatByDefault is null (new pop-open default)', async () => {
        const { findByTestId } = renderConductor({
          journey: { ...perCardJourney, showAssistant: null },
          blocks: buildBlocks({
            showAssistant: true,
            expandChatByDefault: null
          })
        })
        expect(await findByTestId('ChatOverlay-open')).toBeInTheDocument()
      })

      it('does not auto-open the overlay when card.expandChatByDefault is false (collapse opt-in)', async () => {
        const { findByTestId, queryByTestId } = renderConductor({
          journey: { ...perCardJourney, showAssistant: null },
          blocks: buildBlocks({
            showAssistant: true,
            expandChatByDefault: false
          })
        })
        // Wait for Conductor's per-card derivation to settle.
        await findByTestId('PinnedChatBar')
        expect(queryByTestId('ChatOverlay-open')).not.toBeInTheDocument()
      })

      it('does not auto-open the overlay when expandChatByDefault is true but showAssistant is false', async () => {
        const { findByTestId, queryByTestId } = renderConductor({
          journey: { ...perCardJourney, showAssistant: null },
          blocks: buildBlocks({
            showAssistant: false,
            expandChatByDefault: true
          })
        })
        await findByTestId('Conductor')
        expect(queryByTestId('ChatOverlay-open')).not.toBeInTheDocument()
      })

      it('only auto-opens once per (journeyId, cardId) per tab — sessionStorage dedup is honoured across remounts', async () => {
        const blocks = buildBlocks({
          showAssistant: true,
          expandChatByDefault: true
        })
        const journey = { ...perCardJourney, showAssistant: null }

        const first = renderConductor({ journey, blocks })
        expect(await first.findByTestId('ChatOverlay-open')).toBeInTheDocument()
        first.unmount()
        // Same tab (sessionStorage retained), fresh mount: dedup must
        // suppress the auto-open. The bar still renders — it just stays closed.
        blockHistoryVar([])
        const second = renderConductor({ journey, blocks })
        await second.findByTestId('PinnedChatBar')
        expect(second.queryByTestId('ChatOverlay-open')).not.toBeInTheDocument()
      })

      it('re-opens after sessionStorage is cleared (page-reload equivalent)', async () => {
        const blocks = buildBlocks({
          showAssistant: true,
          expandChatByDefault: true
        })
        const journey = { ...perCardJourney, showAssistant: null }

        const first = renderConductor({ journey, blocks })
        expect(await first.findByTestId('ChatOverlay-open')).toBeInTheDocument()
        first.unmount()
        blockHistoryVar([])
        window.sessionStorage.clear()
        const second = renderConductor({ journey, blocks })
        expect(
          await second.findByTestId('ChatOverlay-open')
        ).toBeInTheDocument()
      })

      it('does not auto-open when the apologistChat flag is off, even if expandChatByDefault is true', async () => {
        const { findByTestId, queryByTestId } = renderConductor({
          journey: { ...perCardJourney, showAssistant: true },
          blocks: buildBlocks({
            showAssistant: true,
            expandChatByDefault: true
          }),
          apologistChat: false
        })
        await findByTestId('Conductor')
        expect(queryByTestId('ChatOverlay-open')).not.toBeInTheDocument()
      })

      it('auto-opens the overlay when the apologistChat flag flips from false → true after activeBlock has settled (regression: stale-closure deps)', async () => {
        const journey = { ...perCardJourney, showAssistant: true }
        const blocks = buildBlocks({
          showAssistant: true,
          expandChatByDefault: true
        })

        const { rerender, findByTestId, queryByTestId } = render(
          <FlagsProvider flags={{ apologistChat: false }}>
            <MockedProvider mocks={[]}>
              <SnackbarProvider>
                <JourneyProvider value={{ journey, variant: 'customize' }}>
                  <ChatOverlayProvider journeyId={journey.id}>
                    <Conductor blocks={blocks} />
                  </ChatOverlayProvider>
                </JourneyProvider>
              </SnackbarProvider>
            </MockedProvider>
          </FlagsProvider>
        )

        // Card has settled but the flag is still off — overlay must be closed.
        await findByTestId('Conductor')
        expect(queryByTestId('ChatOverlay-open')).not.toBeInTheDocument()

        // Flip the flag to true (mirrors LaunchDarkly resolving after the
        // initial commit). The auto-open useEffect must re-evaluate even
        // though `activeBlock?.id` did not change.
        rerender(
          <FlagsProvider flags={{ apologistChat: true }}>
            <MockedProvider mocks={[]}>
              <SnackbarProvider>
                <JourneyProvider value={{ journey, variant: 'customize' }}>
                  <ChatOverlayProvider journeyId={journey.id}>
                    <Conductor blocks={blocks} />
                  </ChatOverlayProvider>
                </JourneyProvider>
              </SnackbarProvider>
            </MockedProvider>
          </FlagsProvider>
        )

        expect(await findByTestId('ChatOverlay-open')).toBeInTheDocument()
      })
    })

    describe('mobile drawer + footer coexistence (NES-1727)', () => {
      it('renders the StepFooter alongside the PinnedChatBar when the card has chat', async () => {
        const { findByTestId } = renderConductor({
          journey: { ...perCardJourney, showAssistant: null },
          blocks: buildBlocks({
            showAssistant: true,
            expandChatByDefault: null
          })
        })
        expect(await findByTestId('PinnedChatBar')).toBeInTheDocument()
        // Regression: the footer (host info + chat-button row, including
        // the AiChatButton that opens the drawer) used to be hidden on
        // mobile whenever the card had chat — the drawer now overlays it
        // only while open instead of replacing it.
        expect(await findByTestId('JourneysStepFooter')).toBeInTheDocument()
      })

      it('keeps the PinnedChatBar mounted when expandChatByDefault is false (open state lives in ChatOverlayProvider)', async () => {
        const { findByTestId } = renderConductor({
          journey: { ...perCardJourney, showAssistant: true },
          blocks: buildBlocks({
            showAssistant: true,
            expandChatByDefault: false
          })
        })
        expect(await findByTestId('PinnedChatBar')).toBeInTheDocument()
      })
    })
  })
})
