import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { TreeBlock } from '../../libs/block'
import { EditorProvider } from '../../libs/EditorProvider'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { StepFields } from '../Step/__generated__/StepFields'

import { StepFooter } from './StepFooter'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ stepSlug: null })
}))

vi.mock('../AiChatButton', () => ({
  __esModule: true,
  AiChatButton: () => <div data-testid="AiChatButton" />
}))

const baseJourney: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  featuredAt: null,
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
  seoTitle: 'My awesome journey',
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
  showAssistant: true
}

function buildStep(
  cardOverrides: Partial<{
    showAssistant: boolean | null
    expandChatByDefault: boolean | null
  }> = {}
): TreeBlock<StepFields> {
  return {
    __typename: 'StepBlock',
    id: 'step1.id',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [
      {
        __typename: 'CardBlock',
        id: 'card1.id',
        parentBlockId: 'step1.id',
        parentOrder: 0,
        backgroundColor: null,
        backdropBlur: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        eventLabel: null,
        showAssistant: null,
        expandChatByDefault: null,
        ...cardOverrides,
        children: []
      }
    ]
  }
}

function renderStepFooter(opts: {
  apologistChat?: boolean
  withProvider?: boolean
  journey?: Journey
  selectedStep?: TreeBlock<StepFields> | null
}) {
  const journey = opts.journey ?? baseJourney
  const tree = (
    <MockedProvider>
      <SnackbarProvider>
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <EditorProvider>
            <StepFooter selectedStep={opts.selectedStep} />
          </EditorProvider>
        </JourneyProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
  if (opts.withProvider === false) return render(tree)
  return render(
    <FlagsProvider flags={{ apologistChat: opts.apologistChat ?? false }}>
      {tree}
    </FlagsProvider>
  )
}

describe('StepFooter apologistChat flag gating', () => {
  it('does not render AiChatButton when flag is off', () => {
    const { queryByTestId } = renderStepFooter({ apologistChat: false })
    expect(queryByTestId('AiChatButton')).not.toBeInTheDocument()
  })

  it('does not render AiChatButton when FlagsProvider is absent', () => {
    const { queryByTestId } = renderStepFooter({ withProvider: false })
    expect(queryByTestId('AiChatButton')).not.toBeInTheDocument()
  })

  it('renders AiChatButton when flag is on and card.showAssistant is true', async () => {
    const { findByTestId } = renderStepFooter({
      apologistChat: true,
      selectedStep: buildStep({ showAssistant: true })
    })
    expect(await findByTestId('AiChatButton')).toBeInTheDocument()
  })

  describe('per-card showAssistant', () => {
    it('renders when card.showAssistant is true and journey.showAssistant is null', async () => {
      const journey: Journey = { ...baseJourney, showAssistant: null }
      const { findByTestId } = renderStepFooter({
        apologistChat: true,
        journey,
        selectedStep: buildStep({ showAssistant: true })
      })
      expect(await findByTestId('AiChatButton')).toBeInTheDocument()
    })

    it('does not fall back to journey.showAssistant when card.showAssistant is null', () => {
      const journey: Journey = { ...baseJourney, showAssistant: true }
      const { queryByTestId } = renderStepFooter({
        apologistChat: true,
        journey,
        selectedStep: buildStep({ showAssistant: null })
      })
      expect(queryByTestId('AiChatButton')).not.toBeInTheDocument()
    })

    it('does not render when card.showAssistant is false even if journey.showAssistant is true', () => {
      const journey: Journey = { ...baseJourney, showAssistant: true }
      const { queryByTestId } = renderStepFooter({
        apologistChat: true,
        journey,
        selectedStep: buildStep({ showAssistant: false })
      })
      expect(queryByTestId('AiChatButton')).not.toBeInTheDocument()
    })
  })
})
