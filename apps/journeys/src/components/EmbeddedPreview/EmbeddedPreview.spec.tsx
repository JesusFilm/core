import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { v4 as uuidv4 } from 'uuid'

import { blockHistoryVar } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { STEP_VIEW_EVENT_CREATE } from '@core/journeys/ui/Step/Step'

import {
  JourneyStatus,
  MessagePlatform,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../__generated__/JourneyFields'
import { basic } from '../../libs/testData/storyData'
import {
  JOURNEY_VIEW_EVENT_CREATE,
  JOURNEY_VISITOR_UPDATE
} from '../Conductor/Conductor'

import { EmbeddedPreview } from './EmbeddedPreview'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'My Journey',
  seoTitle: 'My Journey',
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
  slug: 'my journey',
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  featuredAt: null,
  strategySlug: null,
  seoDescription: null,
  template: null,
  chatButtons: [
    {
      __typename: 'ChatButton',
      id: 'chatButtonId',
      link: 'http://me.com',
      platform: MessagePlatform.facebook
    }
  ],
  host: {
    __typename: 'Host',
    id: 'hostId',
    teamId: 'teamId',
    title: 'Bob Jones and Michael Smith',
    location: 'Auckland, NZ',
    src1: 'https://tinyurl.com/3bxusmyb',
    src2: 'https://tinyurl.com/mr4a78kb'
  },
  team: null,
  blocks: basic,
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
  fromTemplateId: null
}

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

global.fetch = jest.fn(
  async () =>
    await Promise.resolve({
      json: async () =>
        await Promise.resolve({
          city: 'Blenheim',
          region: 'Marlborough',
          country: 'New Zealand'
        })
    })
) as jest.Mock

const mocks: MockedResponse[] = [
  {
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
        visitorUpdateForCurrentUser: {
          id: 'uuid',
          __typename: 'Visitor'
        }
      }
    }
  },
  {
    request: {
      query: JOURNEY_VIEW_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          journeyId: 'journeyId',
          label: 'My Journey',
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
  {
    request: {
      query: STEP_VIEW_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'step1.id',
          value: 'Step {{number}}'
        }
      }
    },
    result: {
      data: {
        stepViewEventCreate: {
          id: 'uuid',
          __typename: 'StepViewEvent'
        }
      }
    }
  }
]

describe('EmbeddedPreview', () => {
  mockUuidv4.mockReturnValue('uuid')

  beforeEach(() => {
    document.exitFullscreen = jest.fn()
    document.documentElement.requestFullscreen = jest.fn()
  })

  afterEach(() => jest.clearAllMocks())

  it('renders first block', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'embed' }}>
            <EmbeddedPreview />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(blockHistoryVar()[0].id).toBe('step1.id'))
  })

  it('should toggle fullscreen', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'embed' }}>
            <EmbeddedPreview />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('clickable-card-embed')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('clickable-card-embed'))
    expect(document?.documentElement.requestFullscreen).toHaveBeenCalled()
    await waitFor(() =>
      expect(getByTestId('CloseIconButton')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('CloseIconButton'))
    expect(document?.exitFullscreen).toHaveBeenCalled()
  })

  it('should disable fullscreen', async () => {
    const { queryByTestId } = render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'embed' }}>
            <EmbeddedPreview disableFullscreen />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(queryByTestId('clickable-card-embed')).not.toBeInTheDocument()
  })
})
