import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields } from '../../../../../../../../../__generated__/JourneyFields'
import { MuxVideoUploadProvider } from '../../../../../../../MuxVideoUploadProvider'

import { AddByFile } from '.'

jest.mock('@mux/upchunk', () => ({
  UpChunk: {
    createUpload: () => ({
      on: () => jest.fn()
    })
  }
}))

jest.mock('../../../../../../../../libs/validateMuxLanguage', () => ({
  validateMuxLanguage: jest.fn().mockReturnValue(true)
}))

const mockJourney: Journey = {
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
  status: JourneyStatus.published,
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

async function dropTestVideo(): Promise<void> {
  const dropZone = screen.getByTestId('drop zone')
  const file = new File(['file'], 'testFile.mp4', {
    type: 'video/mp4'
  })
  setFilesOnElement(dropZone, [file])
  await act(async () => {
    fireEvent.drop(dropZone)
  })
}

function setFilesOnElement(element: HTMLElement, files: File[]): void {
  Object.defineProperty(element, 'files', {
    value: files,
    configurable: true
  })
}

const TestWrapper = ({
  children,
  journey = mockJourney
}: {
  children: React.ReactNode
  journey?: JourneyFields | undefined
}): React.ReactElement => (
  <MockedProvider>
    <SnackbarProvider>
      <JourneyProvider value={{ journey: journey }}>
        <EditorProvider
          initialState={{
            selectedBlock: {
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
              eventLabel: null,
              endEventLabel: null,
              children: []
            } as TreeBlock<VideoBlock>
          }}
        >
          <MuxVideoUploadProvider>{children}</MuxVideoUploadProvider>
        </EditorProvider>
      </JourneyProvider>
    </SnackbarProvider>
  </MockedProvider>
)

describe('AddByFile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render drop zone with correct text', () => {
    render(
      <TestWrapper>
        <AddByFile onChange={jest.fn()} />
      </TestWrapper>
    )

    expect(screen.getByTestId('AddByFile')).toBeInTheDocument()
    expect(screen.getByText('Drop a video here')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Upload a video (MP4 or MOV) at least 1 second long. Maximum file size: 1 GB'
      )
    ).toBeInTheDocument()
  })

  it('should render upload button', () => {
    render(
      <TestWrapper>
        <AddByFile onChange={jest.fn()} />
      </TestWrapper>
    )

    expect(
      screen.getByRole('button', { name: /Upload file/i })
    ).toBeInTheDocument()
  })

  it('should clear errors on drop', async () => {
    render(
      <TestWrapper>
        <AddByFile onChange={jest.fn()} />
      </TestWrapper>
    )

    const dropZone = screen.getByTestId('drop zone')

    // First, trigger an error state by dropping invalid files
    const invalidFile1 = new File(['file'], 'testFile.mp4', {
      type: 'video/mp4'
    })
    const invalidFile2 = new File(['file'], 'testFile.png', {
      type: 'video/png'
    })
    setFilesOnElement(dropZone, [invalidFile1, invalidFile2])

    await act(async () => {
      fireEvent.drop(dropZone)
    })

    // Should show error
    expect(screen.getAllByTestId('AlertTriangleIcon').length).toBeGreaterThan(0)

    // Now drop a valid single file
    const validFile = new File(['file'], 'testFile.mp4', {
      type: 'video/mp4'
    })
    setFilesOnElement(dropZone, [validFile])

    await act(async () => {
      fireEvent.drop(dropZone)
    })

    // Error should be cleared (Upload Failed! should not be present)
    await waitFor(() => {
      expect(screen.queryByText('Upload Failed!')).not.toBeInTheDocument()
    })
  })

  it('should show error state on file rejection - too many files', async () => {
    render(
      <TestWrapper>
        <AddByFile onChange={jest.fn()} />
      </TestWrapper>
    )

    const dropZone = screen.getByTestId('drop zone')
    const file1 = new File(['file'], 'testFile1.mp4', {
      type: 'video/mp4'
    })
    const file2 = new File(['file'], 'testFile2.mp4', {
      type: 'video/mp4'
    })
    setFilesOnElement(dropZone, [file1, file2])

    await act(async () => {
      fireEvent.drop(dropZone)
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('AlertTriangleIcon')).toHaveLength(2)
      expect(screen.getByText('Upload Failed!')).toBeInTheDocument()
    })
  })

  it('should show error for file too large', async () => {
    render(
      <TestWrapper>
        <AddByFile onChange={jest.fn()} />
      </TestWrapper>
    )

    const dropZone = screen.getByTestId('drop zone')
    // Create a file larger than 1GB (mocked)
    const largeFile = new File(['file'], 'large.mp4', {
      type: 'video/mp4'
    })
    Object.defineProperty(largeFile, 'size', {
      value: 1000000001,
      configurable: true
    })

    setFilesOnElement(dropZone, [largeFile])

    await act(async () => {
      fireEvent.drop(dropZone)
    })

    await waitFor(() => {
      expect(screen.getByText('Upload Failed!')).toBeInTheDocument()
      expect(
        screen.getByText('File is too large. Max size is 1 GB.')
      ).toBeInTheDocument()
    })
  })

  it('should disable button when no video block is selected', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: mockJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: undefined
              }}
            >
              <MuxVideoUploadProvider>
                <AddByFile onChange={jest.fn()} />
              </MuxVideoUploadProvider>
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByText('Select a video block first')).toBeInTheDocument()
  })

  it('should handle journey with valid Mux language', () => {
    render(
      <TestWrapper journey={mockJourney}>
        <AddByFile onChange={jest.fn()} />
      </TestWrapper>
    )

    expect(screen.getByTestId('AddByFile')).toBeInTheDocument()
  })

  it('should handle journey with invalid Mux language', () => {
    const {
      validateMuxLanguage
    } = require('../../../../../../../../libs/validateMuxLanguage')
    validateMuxLanguage.mockReturnValue(false)

    const journeyWithInvalidLanguage = {
      ...mockJourney,
      language: {
        __typename: 'Language' as const,
        id: '999',
        bcp47: 'jp',
        iso3: null,
        name: [
          {
            __typename: 'LanguageName' as const,
            value: 'Japanese',
            primary: true
          }
        ]
      }
    }

    render(
      <TestWrapper journey={journeyWithInvalidLanguage}>
        <AddByFile onChange={jest.fn()} />
      </TestWrapper>
    )

    expect(screen.getByTestId('AddByFile')).toBeInTheDocument()
  })

  it('should handle journey without language', () => {
    const journeyWithoutLanguage = {
      ...mockJourney,
      language: null as unknown as Journey['language']
    }

    render(
      <TestWrapper journey={journeyWithoutLanguage}>
        <AddByFile onChange={jest.fn()} />
      </TestWrapper>
    )

    expect(screen.getByTestId('AddByFile')).toBeInTheDocument()
  })
})
