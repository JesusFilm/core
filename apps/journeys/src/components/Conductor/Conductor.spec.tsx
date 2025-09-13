import { MockedProvider } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { v4 as uuidv4 } from 'uuid'

import {
  TreeBlock,
  blockHistoryVar,
  treeBlocksVar
} from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
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

jest.mock('@core/shared/ui/useBreakpoints', () => ({
  __esModule: true,
  useBreakpoints: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

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

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Conductor', () => {
  beforeEach(() => {
    const useBreakpointsMock = useBreakpoints as jest.Mock
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
    socialNodeX: null,
    socialNodeY: null,
    journeyTheme: null,
    journeyCustomizationDescription: null,
    journeyCustomizationFields: [],
    fromTemplateId: null
  }

  it('should create a journeyViewEvent', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')

    const result = jest.fn(() => ({
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
      <MockedProvider>
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
        <MockedProvider mocks={[]}>
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
        <MockedProvider mocks={[]}>
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
})
