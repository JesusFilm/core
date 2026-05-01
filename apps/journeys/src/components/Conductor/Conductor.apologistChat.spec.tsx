import { type Mock } from 'vitest'
import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
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

vi.mock('@core/journeys/ui/PinnedChatBar', () => ({
  __esModule: true,
  PinnedChatBar: () => <div data-testid="PinnedChatBar" />
}))

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

const lastStepOnly: TreeBlock[] = [
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
        children: []
      }
    ]
  }
]

describe('Conductor apologistChat flag gating', () => {
  const journeyWithAssistant: Journey = {
    ...baseJourney,
    showAssistant: true
  }

  it('does not render PinnedChatBar when apologistChat flag is off', () => {
    const { queryByTestId } = render(
      <FlagsProvider flags={{ apologistChat: false }}>
        <MockedProvider mocks={[]}>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: journeyWithAssistant, variant: 'customize' }}
            >
              <Conductor blocks={lastStepOnly} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      </FlagsProvider>
    )
    expect(queryByTestId('PinnedChatBar')).not.toBeInTheDocument()
  })

  it('does not render PinnedChatBar when FlagsProvider is absent', () => {
    const { queryByTestId } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{ journey: journeyWithAssistant, variant: 'customize' }}
          >
            <Conductor blocks={lastStepOnly} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(queryByTestId('PinnedChatBar')).not.toBeInTheDocument()
  })

  it('does not render PinnedChatBar when flag is on but showAssistant is false', () => {
    const { queryByTestId } = render(
      <FlagsProvider flags={{ apologistChat: true }}>
        <MockedProvider mocks={[]}>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: { ...baseJourney, showAssistant: false },
                variant: 'customize'
              }}
            >
              <Conductor blocks={lastStepOnly} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      </FlagsProvider>
    )
    expect(queryByTestId('PinnedChatBar')).not.toBeInTheDocument()
  })

  it('renders PinnedChatBar when flag is on and showAssistant is true', async () => {
    const { findByTestId } = render(
      <FlagsProvider flags={{ apologistChat: true }}>
        <MockedProvider mocks={[]}>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: journeyWithAssistant, variant: 'customize' }}
            >
              <Conductor blocks={lastStepOnly} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      </FlagsProvider>
    )
    expect(await findByTestId('PinnedChatBar')).toBeInTheDocument()
  })
})
