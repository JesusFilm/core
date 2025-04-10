import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { VideoProvider } from '../../../../../../../libs/VideoProvider'

import {
  CREATE_STUDY_QUESTION,
  StudyQuestionCreate
} from './StudyQuestionCreate'

// Define the enum locally for testing purposes
enum VideoLabel {
  collection = 'collection',
  episode = 'episode',
  featureFilm = 'featureFilm',
  segment = 'segment',
  series = 'series',
  shortFilm = 'shortFilm',
  trailer = 'trailer',
  behindTheScenes = 'behindTheScenes'
}

const video = {
  id: 'video-1',
  slug: 'test-video',
  label: VideoLabel.featureFilm,
  published: true,
  title: [{ id: '1', value: 'Test Video' }],
  locked: false,
  images: [],
  imageAlt: [],
  noIndex: false,
  description: [],
  snippet: [],
  children: [],
  variants: [],
  studyQuestions: [],
  variantLanguagesCount: 0,
  subtitles: [],
  videoEditions: []
}

describe('StudyQuestionCreate', () => {
  it('should render create button', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider video={video}>
            <StudyQuestionCreate videoId="video-1" order={3} />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should open dialog on button click', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider video={video}>
            <StudyQuestionCreate videoId="video-1" order={3} />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should create study question with correct order and trigger refetch', async () => {
    const onQuestionAdded = jest.fn()

    // Create the mocks
    const mocks = [
      {
        request: {
          query: CREATE_STUDY_QUESTION,
          variables: {
            input: {
              videoId: 'video-1',
              value: 'New question',
              languageId: '529',
              primary: true,
              order: 3
            }
          }
        },
        result: {
          data: {
            videoStudyQuestionCreate: {
              id: '3',
              value: 'New question',
              __typename: 'VideoStudyQuestion'
            }
          }
        }
      }
    ]

    render(
      <MockedProvider mocks={mocks} addTypename={true}>
        <SnackbarProvider>
          <VideoProvider video={video}>
            <StudyQuestionCreate
              videoId="video-1"
              order={3}
              onQuestionAdded={onQuestionAdded}
            />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Click the Add button to open the dialog
    fireEvent.click(screen.getByText('Add'))

    // Fill out the form and submit
    fireEvent.change(screen.getByPlaceholderText('Enter study question'), {
      target: { value: 'New question' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    // Verify the dialog closes
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Check that onQuestionAdded was called
    expect(onQuestionAdded).toHaveBeenCalled()
  })

  it('should handle error', async () => {
    const mocks = [
      {
        request: {
          query: CREATE_STUDY_QUESTION,
          variables: {
            input: {
              videoId: 'video-1',
              value: 'New question',
              languageId: '529',
              primary: true,
              order: 3
            }
          }
        },
        error: new Error('Failed to create')
      }
    ]

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SnackbarProvider>
          <VideoProvider video={video}>
            <StudyQuestionCreate videoId="video-1" order={3} />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Add'))
    fireEvent.change(screen.getByPlaceholderText('Enter study question'), {
      target: { value: 'New question' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to create')).toBeInTheDocument()
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
