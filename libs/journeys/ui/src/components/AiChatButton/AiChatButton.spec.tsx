import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { ChatOverlayProvider } from '../../libs/ChatOverlayProvider'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'

import { AiChatButton } from './AiChatButton'

jest.mock('../ChatOverlay', () => ({
  __esModule: true,
  ChatOverlay: ({ open }: { open: boolean }) =>
    open ? <div data-testid="ChatOverlay-open" /> : null
}))

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 't',
  featuredAt: null,
  strategySlug: null,
  slug: 's',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [{ __typename: 'LanguageName', value: 'English', primary: true }]
  },
  description: null,
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

function renderButton(variant: 'default' | 'admin' | 'embed' = 'default') {
  return render(
    <ChatOverlayProvider journeyId={journey.id}>
      <JourneyProvider value={{ journey, variant }}>
        <AiChatButton />
      </JourneyProvider>
    </ChatOverlayProvider>
  )
}

describe('AiChatButton', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('renders a button with an accessible label', () => {
    const { getByRole } = renderButton()
    expect(getByRole('button', { name: 'Open AI chat' })).toBeInTheDocument()
  })

  it('opens the overlay via the lifted state when clicked', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByTestId, getByTestId } = renderButton()

    expect(queryByTestId('ChatOverlay-open')).not.toBeInTheDocument()
    await user.click(getByRole('button', { name: 'Open AI chat' }))
    expect(getByTestId('ChatOverlay-open')).toBeInTheDocument()
  })

  it('renders nothing in admin variant', () => {
    const { container } = renderButton('admin')
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing in embed variant', () => {
    const { container } = renderButton('embed')
    expect(container.firstChild).toBeNull()
  })

  it('shares state across instances under the same provider', async () => {
    const user = userEvent.setup()
    const { getAllByRole, getAllByTestId } = render(
      <ChatOverlayProvider journeyId={journey.id}>
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <AiChatButton />
          <AiChatButton />
        </JourneyProvider>
      </ChatOverlayProvider>
    )

    const buttons = getAllByRole('button', { name: 'Open AI chat' })
    await user.click(buttons[0])
    // Both AiChatButton instances should reflect the same open state.
    expect(getAllByTestId('ChatOverlay-open')).toHaveLength(2)
  })
})
