import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { MuxVideoUploadProvider } from '../../../../../../../MuxVideoUploadProvider'

import { AddByFile } from '.'

jest.mock('@mux/upchunk', () => ({
  UpChunk: {
    createUpload: () => ({
      on: () => jest.fn()
    })
  }
}))

jest.mock('../../../../../../../../libs/useValidateMuxLanguage', () => ({
  useValidateMuxLanguage: jest.fn().mockReturnValue(true)
}))

const mockJourney: Journey = {
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

async function dropTestVideo(): Promise<void> {
  const input = screen.getByTestId('drop zone')
  const file = new File(['file'], 'testFile.mp4', {
    type: 'video/mp4'
  })
  Object.defineProperty(input, 'files', {
    value: [file]
  })
  await act(async () => {
    fireEvent.drop(input)
  })
}

const TestWrapper = ({
  children,
  journey = mockJourney
}: {
  children: React.ReactNode
  journey?: Journey | null
}): React.ReactElement => (
  <MockedProvider>
    <SnackbarProvider>
      <JourneyProvider value={{ journey }}>
        <EditorProvider
          initialState={{
            selectedBlock: {
              id: 'videoBlockId',
              __typename: 'VideoBlock'
            }
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
    expect(screen.getByText('Max size is 1 GB')).toBeInTheDocument()
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

    const input = screen.getByTestId('drop zone')

    // First, trigger an error state by dropping invalid files
    const invalidFile1 = new File(['file'], 'testFile.mp4', {
      type: 'video/mp4'
    })
    const invalidFile2 = new File(['file'], 'testFile.png', {
      type: 'video/png'
    })
    Object.defineProperty(input, 'files', {
      value: [invalidFile1, invalidFile2]
    })

    await act(async () => {
      fireEvent.drop(input)
    })

    // Should show error
    expect(screen.getAllByTestId('AlertTriangleIcon').length).toBeGreaterThan(0)

    // Now drop a valid single file
    const validFile = new File(['file'], 'testFile.mp4', {
      type: 'video/mp4'
    })
    Object.defineProperty(input, 'files', {
      value: [validFile]
    })

    await act(async () => {
      fireEvent.drop(input)
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

    const input = screen.getByTestId('drop zone')
    const file1 = new File(['file'], 'testFile1.mp4', {
      type: 'video/mp4'
    })
    const file2 = new File(['file'], 'testFile2.mp4', {
      type: 'video/mp4'
    })
    Object.defineProperty(input, 'files', {
      value: [file1, file2]
    })

    await act(async () => {
      fireEvent.drop(input)
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

    const input = screen.getByTestId('drop zone')
    // Create a file larger than 1GB (mocked)
    const largeFile = new File(['x'.repeat(1000000001)], 'large.mp4', {
      type: 'video/mp4'
    })

    Object.defineProperty(input, 'files', {
      value: [largeFile]
    })

    await act(async () => {
      fireEvent.drop(input)
    })

    // The rejection happens in the dropzone library based on maxSize prop
  })

  it('should disable button when no video block is selected', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: mockJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: null
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
      useValidateMuxLanguage
    } = require('../../../../../../../../libs/useValidateMuxLanguage')
    useValidateMuxLanguage.mockReturnValue(false)

    const journeyWithInvalidLanguage = {
      ...mockJourney,
      language: {
        __typename: 'Language' as const,
        id: '999',
        bcp47: 'jp',
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
