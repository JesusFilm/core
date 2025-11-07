import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { useValidateMuxLanguage } from '../../../../../../../libs/useValidateMuxLanguage'

import { VideoFromMux } from './VideoFromMux'

jest.mock('../../../../../../../libs/useValidateMuxLanguage', () => ({
  __esModule: true,
  useValidateMuxLanguage: jest.fn()
}))

jest.mock('./AddByFile', () => {
  const Button = require('@mui/material/Button').default

  return {
    __esModule: true,
    AddByFile: ({
      onChange
    }: {
      onChange: (id: string, shouldCloseDrawer?: boolean) => void
    }) => {
      const handleClick = (): void => {
        onChange('mock-video-id', true)
      }

      return (
        <Button data-testid="mock-add-by-file" onClick={handleClick}>
          Mock AddByFile
        </Button>
      )
    }
  }
})

const mockUseValidateMuxLanguage = jest.mocked(useValidateMuxLanguage)

const mockJourneyWithValidLanguage: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  title: 'Journey Title',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  slug: 'journey-slug',
  description: 'Journey description',
  status: null,
  createdAt: '2021-01-01',
  publishedAt: null,
  featuredAt: null,
  seoTitle: null,
  seoDescription: null,
  template: null,
  strategySlug: null,
  primaryImageBlock: null,
  host: null,
  team: null,
  userJourneys: [],
  tags: [],
  website: null,
  menuStepBlock: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  chatButtons: [],
  trashedAt: null
}

const mockJourneyWithInvalidLanguage: Journey = {
  ...mockJourneyWithValidLanguage,
  language: {
    __typename: 'Language',
    id: '999',
    bcp47: 'jp',
    name: [
      {
        __typename: 'LanguageName',
        value: 'Japanese',
        primary: true
      }
    ]
  }
}

describe('VideoFromMux', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseValidateMuxLanguage.mockReturnValue(true)
  })

  it('renders AddByFile trigger', () => {
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourneyWithValidLanguage }}>
          <EditorProvider
            initialState={{
              selectedBlock: {
                id: 'videoBlockId',
                __typename: 'VideoBlock'
              }
            }}
          >
            <VideoFromMux onSelect={onSelect} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('VideoFromMux')).toBeInTheDocument()
    expect(screen.getByTestId('mock-add-by-file')).toBeInTheDocument()
  })

  it('invokes onSelect with subtitle language when validation succeeds', () => {
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourneyWithValidLanguage }}>
          <EditorProvider
            initialState={{
              selectedBlock: {
                id: 'videoBlockId',
                __typename: 'VideoBlock'
              }
            }}
          >
            <VideoFromMux onSelect={onSelect} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('mock-add-by-file'))

    expect(onSelect).toHaveBeenCalledWith(
      {
        videoId: 'mock-video-id',
        source: VideoBlockSource.mux,
        startAt: 0,
        subtitleLanguageId: '529'
      },
      true
    )
    expect(mockUseValidateMuxLanguage).toHaveBeenCalledWith('en')
  })

  it('omits subtitle language when validation fails', () => {
    mockUseValidateMuxLanguage.mockReturnValue(false)
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourneyWithInvalidLanguage }}>
          <EditorProvider
            initialState={{
              selectedBlock: {
                id: 'videoBlockId',
                __typename: 'VideoBlock'
              }
            }}
          >
            <VideoFromMux onSelect={onSelect} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('mock-add-by-file'))

    expect(onSelect).toHaveBeenCalledWith(
      {
        videoId: 'mock-video-id',
        source: VideoBlockSource.mux,
        startAt: 0
      },
      true
    )
    expect(mockUseValidateMuxLanguage).toHaveBeenCalledWith('jp')
  })

  it('omits subtitle language when journey is missing', () => {
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: null }}>
          <EditorProvider
            initialState={{
              selectedBlock: {
                id: 'videoBlockId',
                __typename: 'VideoBlock'
              }
            }}
          >
            <VideoFromMux onSelect={onSelect} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('mock-add-by-file'))

    expect(onSelect).toHaveBeenCalledWith(
      {
        videoId: 'mock-video-id',
        source: VideoBlockSource.mux,
        startAt: 0
      },
      true
    )
    expect(mockUseValidateMuxLanguage).toHaveBeenCalledWith(undefined)
  })
})
