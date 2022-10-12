import { useBreakpoints } from '@core/shared/ui/useBreakpoints'
import type { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { activeBlockVar, treeBlocksVar } from '@core/journeys/ui/block'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_language as Language
} from '../../../__generated__/GetJourney'
import {
  ThemeName,
  ThemeMode,
  JourneyStatus
} from '../../../__generated__/globalTypes'
import { basic } from '../../libs/testData/storyData'
import { JOURNEY_VIEW_EVENT_CREATE } from './Conductor'
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

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

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

// const rtlLanguage: Language = {
//   __typename: 'Language',
//   id: '529',
//   bcp47: 'ar',
//   iso3: 'arb',
//   name: [
//     {
//       __typename: 'Translation',
//       value: 'Arabic',
//       primary: false
//     }
//   ]
// }

const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null
}

describe('Conductor', () => {
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
                  journeyId: 'journeyId'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey
          }}
        >
          <Conductor blocks={[]} />
        </JourneyProvider>
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
                  journeyId: 'journeyId'
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
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              title: 'journey title'
            } as unknown as Journey
          }}
        >
          <Conductor blocks={[]} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'journey_view',
          journeyId: 'journeyId',
          eventId: 'uuid',
          journeyTitle: 'journey title'
        }
      })
    )
  })

  it('should not throw error if no blocks', () => {
    const blocks: TreeBlock[] = []
    render(
      <MockedProvider>
        <Conductor blocks={blocks} />
      </MockedProvider>
    )
    expect(treeBlocksVar()).toBe(blocks)
    expect(activeBlockVar()).toBe(null)
  })

  it('should navigate to next block on right button click', () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={[]}>
        <JourneyProvider>
          <Conductor blocks={basic} />
        </JourneyProvider>
      </MockedProvider>
    )
    const leftButton = queryByTestId('conductorLeftButton')
    const rightButton = getByTestId('conductorRightButton')

    expect(treeBlocksVar()).toBe(basic)
    expect(activeBlockVar()?.id).toBe('step1.id')
    expect(leftButton).not.toBeInTheDocument()
    expect(rightButton).not.toBeDisabled()
    expect(rightButton).toHaveStyle('cursor: pointer;')

    fireEvent.click(rightButton)

    expect(activeBlockVar()?.id).toBe('step2.id')
  })

  it('should disable navigating to previous step by default', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <Conductor blocks={basic} />
        </JourneyProvider>
      </MockedProvider>
    )

    const rightButton = getByTestId('conductorRightButton')
    fireEvent.click(rightButton)
    expect(activeBlockVar()?.id).toBe('step2.id')
    const leftButton = getByTestId('conductorLeftButton')

    expect(leftButton).toBeInTheDocument()
    expect(leftButton).toBeDisabled()
  })

  it('should disable right button if next step is locked', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <Conductor blocks={basic} />
        </JourneyProvider>
      </MockedProvider>
    )

    const rightButton = getByTestId('conductorRightButton')
    fireEvent.click(rightButton)
    expect(activeBlockVar()?.id).toBe('step2.id')

    expect(rightButton).toBeDisabled()
  })

  it('should not show right button if on last card', () => {
    const { getByTestId, getAllByRole } = render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <Conductor blocks={basic} />
        </JourneyProvider>
      </MockedProvider>
    )

    const rightButton = getByTestId('conductorRightButton')

    fireEvent.click(rightButton)
    fireEvent.click(
      getAllByRole('button', { name: 'Step 3 (No nextBlockId)' })[0]
    )
    fireEvent.click(rightButton)

    expect(activeBlockVar()?.id).toBe('step4.id')
    expect(rightButton).not.toBeInTheDocument()
  })
})
