import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { type Mock } from 'vitest'

import { TreeBlock, blockHistoryVar } from '@core/journeys/ui/block'
import { ChatOverlayProvider } from '@core/journeys/ui/ChatOverlayProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_language as Language
} from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'

import { Conductor } from '.'

vi.mock('@next/third-parties/google', () => ({
  sendGTMEvent: vi.fn()
}))

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

// Capture `initialExpanded` so we can assert the mobile collapsed-vs-idle
// mapping is forwarded from per-card `expandChatByDefault`.
vi.mock('@core/journeys/ui/PinnedChatBar', () => ({
  __esModule: true,
  PinnedChatBar: (props: { initialExpanded?: boolean }) => (
    <div
      data-testid="PinnedChatBar"
      data-initial-expanded={String(props.initialExpanded ?? true)}
    />
  )
}))

// Replace ChatOverlay with a tiny renderer that exposes `open` so we can
// assert the auto-open useEffect actually drove `setOpen(true)` through the
// real ChatOverlayProvider → AiChatButton wiring.
vi.mock('@core/journeys/ui/ChatOverlay', () => ({
  __esModule: true,
  ChatOverlay: ({ open }: { open: boolean }) =>
    open ? <div data-testid="ChatOverlay-open" /> : null
}))

const originalFetch = global.fetch

global.fetch = vi.fn(
  async () =>
    await Promise.resolve({
      json: async () => await Promise.resolve({})
    })
) as Mock

const language: Language = {
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
}

const baseJourney: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  title: 'my journey',
  strategySlug: null,
  slug: 'my-journey',
  language,
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

describe('Conductor per-card chat', () => {
  beforeEach(() => {
    blockHistoryVar([])
    window.sessionStorage.clear()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  describe('per-card showAssistant', () => {
    it('renders PinnedChatBar when card.showAssistant is true and journey.showAssistant is null', async () => {
      const { findByTestId } = renderConductor({
        journey: { ...baseJourney, showAssistant: null },
        blocks: buildBlocks({
          showAssistant: true,
          expandChatByDefault: null
        })
      })
      expect(await findByTestId('PinnedChatBar')).toBeInTheDocument()
    })

    it('hides PinnedChatBar when card.showAssistant is false even if journey.showAssistant is true (per-card opt-out wins)', async () => {
      const { queryByTestId, findByTestId } = renderConductor({
        journey: { ...baseJourney, showAssistant: true },
        blocks: buildBlocks({
          showAssistant: false,
          expandChatByDefault: null
        })
      })
      // Wait for the activeBlock-driven re-render so the verdict is stable.
      await findByTestId('Conductor')
      expect(queryByTestId('PinnedChatBar')).not.toBeInTheDocument()
    })

    it('falls back to journey.showAssistant when card.showAssistant is null', async () => {
      const { findByTestId } = renderConductor({
        journey: { ...baseJourney, showAssistant: true },
        blocks: buildBlocks({
          showAssistant: null,
          expandChatByDefault: null
        })
      })
      expect(await findByTestId('PinnedChatBar')).toBeInTheDocument()
    })
  })

  describe('expandChatByDefault auto-open', () => {
    it('opens the desktop ChatOverlay on initial mount when card.expandChatByDefault is true', async () => {
      const { findByTestId } = renderConductor({
        journey: { ...baseJourney, showAssistant: null },
        blocks: buildBlocks({
          showAssistant: true,
          expandChatByDefault: true
        })
      })
      expect(await findByTestId('ChatOverlay-open')).toBeInTheDocument()
    })

    it('does not auto-open the overlay when card.expandChatByDefault is null', async () => {
      const { findByTestId, queryByTestId } = renderConductor({
        journey: { ...baseJourney, showAssistant: null },
        blocks: buildBlocks({
          showAssistant: true,
          expandChatByDefault: null
        })
      })
      // Wait for Conductor's per-card derivation to settle.
      await findByTestId('PinnedChatBar')
      expect(queryByTestId('ChatOverlay-open')).not.toBeInTheDocument()
    })

    it('does not auto-open the overlay when expandChatByDefault is true but showAssistant is false', async () => {
      const { findByTestId, queryByTestId } = renderConductor({
        journey: { ...baseJourney, showAssistant: null },
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
      const journey = { ...baseJourney, showAssistant: null }

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
      const journey = { ...baseJourney, showAssistant: null }

      const first = renderConductor({ journey, blocks })
      expect(await first.findByTestId('ChatOverlay-open')).toBeInTheDocument()
      first.unmount()
      blockHistoryVar([])
      window.sessionStorage.clear()
      const second = renderConductor({ journey, blocks })
      expect(await second.findByTestId('ChatOverlay-open')).toBeInTheDocument()
    })

    it('does not auto-open when the apologistChat flag is off, even if expandChatByDefault is true', async () => {
      const { findByTestId, queryByTestId } = renderConductor({
        journey: { ...baseJourney, showAssistant: true },
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
      const journey = { ...baseJourney, showAssistant: true }
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

  describe('mobile sheet initial state', () => {
    it('passes initialExpanded=true to PinnedChatBar when card.expandChatByDefault is true (idle, ready to type)', async () => {
      const { findByTestId } = renderConductor({
        journey: { ...baseJourney, showAssistant: true },
        blocks: buildBlocks({
          showAssistant: true,
          expandChatByDefault: true
        })
      })
      const bar = await findByTestId('PinnedChatBar')
      expect(bar.getAttribute('data-initial-expanded')).toBe('true')
    })

    it('passes initialExpanded=false to PinnedChatBar when card.expandChatByDefault is false (collapsed, drag handle only)', async () => {
      const { findByTestId } = renderConductor({
        journey: { ...baseJourney, showAssistant: true },
        blocks: buildBlocks({
          showAssistant: true,
          expandChatByDefault: false
        })
      })
      const bar = await findByTestId('PinnedChatBar')
      expect(bar.getAttribute('data-initial-expanded')).toBe('false')
    })

    it('passes initialExpanded=false to PinnedChatBar when card.expandChatByDefault is null (legacy default → collapsed)', async () => {
      const { findByTestId } = renderConductor({
        journey: { ...baseJourney, showAssistant: true },
        blocks: buildBlocks({
          showAssistant: true,
          expandChatByDefault: null
        })
      })
      const bar = await findByTestId('PinnedChatBar')
      expect(bar.getAttribute('data-initial-expanded')).toBe('false')
    })
  })
})
