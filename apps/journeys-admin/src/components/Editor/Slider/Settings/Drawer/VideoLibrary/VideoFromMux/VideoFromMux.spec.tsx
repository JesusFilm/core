import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../../__generated__/globalTypes'
import { validateMuxLanguage } from '../../../../../../../libs/validateMuxLanguage'

import { VideoFromMux } from './VideoFromMux'

jest.mock('../../../../../../../libs/validateMuxLanguage', () => ({
  __esModule: true,
  validateMuxLanguage: jest.fn()
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

const mockValidateMuxLanguage = jest.mocked(validateMuxLanguage)

const selectedVideoBlock: TreeBlock<VideoBlock> = {
  id: 'videoBlockId',
  __typename: 'VideoBlock',
  parentBlockId: null,
  parentOrder: null,
  muted: null,
  autoplay: null,
  startAt: null,
  endAt: null,
  posterBlockId: null,
  fullsize: null,
  action: null,
  videoId: null,
  videoVariantLanguageId: null,
  source: VideoBlockSource.mux,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  subtitleLanguage: null,
  showGeneratedSubtitles: false,
  mediaVideo: null,
  children: []
}

const mockJourneyWithValidLanguage: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  title: 'Journey Title',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: null,
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
  status: JourneyStatus.draft,
  createdAt: '2021-01-01',
  updatedAt: '2021-01-01',
  publishedAt: null,
  featuredAt: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  seoTitle: null,
  seoDescription: null,
  template: null,
  strategySlug: null,
  blocks: null,
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: null,
  host: null,
  team: null,
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
  socialNodeX: null,
  socialNodeY: null,
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: [],
  fromTemplateId: null
}

const mockJourneyWithInvalidLanguage: Journey = {
  ...mockJourneyWithValidLanguage,
  language: {
    __typename: 'Language',
    id: '999',
    bcp47: 'jp',
    iso3: null,
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
    mockValidateMuxLanguage.mockReturnValue(true)
  })

  it('renders AddByFile trigger', () => {
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourneyWithValidLanguage }}>
          <EditorProvider
            initialState={{
              selectedBlock: selectedVideoBlock
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
              selectedBlock: selectedVideoBlock
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
    expect(mockValidateMuxLanguage).toHaveBeenCalledWith('en')
  })

  it('omits subtitle language when validation fails', () => {
    mockValidateMuxLanguage.mockReturnValue(false)
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourneyWithInvalidLanguage }}>
          <EditorProvider
            initialState={{
              selectedBlock: selectedVideoBlock
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
    expect(mockValidateMuxLanguage).toHaveBeenCalledWith('jp')
  })

  it('omits subtitle language when journey is missing', () => {
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: undefined }}>
          <EditorProvider
            initialState={{
              selectedBlock: selectedVideoBlock
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
    expect(mockValidateMuxLanguage).toHaveBeenCalledWith(undefined)
  })

  it('should call onSelect with correct block data when valid language', () => {
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourneyWithValidLanguage }}>
          <EditorProvider
            initialState={{
              selectedBlock: selectedVideoBlock
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
    expect(mockValidateMuxLanguage).toHaveBeenCalledWith('en')
  })

  it('should handle invalid language by not including subtitleLanguageId', () => {
    mockValidateMuxLanguage.mockReturnValue(false)
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourneyWithInvalidLanguage }}>
          <EditorProvider
            initialState={{
              selectedBlock: selectedVideoBlock
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
    expect(mockValidateMuxLanguage).toHaveBeenCalledWith('jp')
  })

  it('should handle missing journey', () => {
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: undefined }}>
          <EditorProvider
            initialState={{
              selectedBlock: selectedVideoBlock
            }}
          >
            <VideoFromMux onSelect={onSelect} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('VideoFromMux')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('mock-add-by-file'))

    expect(onSelect).toHaveBeenCalledWith(
      {
        videoId: 'mock-video-id',
        source: VideoBlockSource.mux,
        startAt: 0
      },
      true
    )
  })

  it('should create correct block update input with valid language', () => {
    mockValidateMuxLanguage.mockReturnValue(true)
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourneyWithValidLanguage }}>
          <EditorProvider
            initialState={{
              selectedBlock: selectedVideoBlock
            }}
          >
            <VideoFromMux onSelect={onSelect} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    // The component should be rendered correctly
    expect(screen.getByTestId('VideoFromMux')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('mock-add-by-file'))

    // Verify the expected block structure includes subtitleLanguageId
    expect(onSelect).toHaveBeenCalledWith(
      {
        videoId: 'mock-video-id',
        source: VideoBlockSource.mux,
        startAt: 0,
        subtitleLanguageId: '529'
      },
      true
    )

    // Verify the block structure has all required fields
    const callArgs = onSelect.mock.calls[0][0]
    expect(callArgs).toHaveProperty('videoId')
    expect(callArgs).toHaveProperty('source', VideoBlockSource.mux)
    expect(callArgs).toHaveProperty('startAt', 0)
    expect(callArgs).toHaveProperty('subtitleLanguageId', '529')
  })

  it('should create correct block update input without subtitleLanguageId for invalid language', () => {
    mockValidateMuxLanguage.mockReturnValue(false)
    const onSelect = jest.fn()

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourneyWithInvalidLanguage }}>
          <EditorProvider
            initialState={{
              selectedBlock: selectedVideoBlock
            }}
          >
            <VideoFromMux onSelect={onSelect} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('VideoFromMux')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('mock-add-by-file'))

    expect(onSelect).toHaveBeenCalledWith(
      {
        videoId: 'mock-video-id',
        source: VideoBlockSource.mux,
        startAt: 0
      },
      true
    )

    const callArgs = onSelect.mock.calls[0][0]
    expect(callArgs).not.toHaveProperty('subtitleLanguageId')
  })
})
