import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { EditorProvider } from '../../libs/EditorProvider'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'

import { StepFooter } from './StepFooter'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/navigation', () => ({
  useParams: () => ({ stepSlug: null })
}))

jest.mock('../AiChatButton', () => ({
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

function renderStepFooter(opts: {
  apologistChat?: boolean
  withProvider?: boolean
}) {
  const tree = (
    <MockedProvider>
      <SnackbarProvider>
        <JourneyProvider value={{ journey: baseJourney, variant: 'default' }}>
          <EditorProvider>
            <StepFooter />
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

  it('renders AiChatButton when flag is on and showAssistant is true', async () => {
    const { findByTestId } = renderStepFooter({ apologistChat: true })
    expect(await findByTestId('AiChatButton')).toBeInTheDocument()
  })
})
