import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

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

const messages = {
  'Study Question': 'Study Question',
  'Enter study question': 'Enter study question',
  'Add Study Question': 'Add Study Question',
  Add: 'Add',
  'Study question is required': 'Study question is required',
  'Failed to create': 'Failed to create',
  'Study question created': 'Study question created'
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

const mockStudyQuestions = [
  { id: '1', value: 'Question 1' },
  { id: '2', value: 'Question 2' }
]

describe('StudyQuestionCreate', () => {
  it('should render create button', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionCreate studyQuestions={mockStudyQuestions} />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should open dialog on button click', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionCreate studyQuestions={mockStudyQuestions} />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should create study question with correct order and trigger refetch', async () => {
    const nextOrder = mockStudyQuestions.length + 1
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
              order: nextOrder
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
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionCreate
                studyQuestions={mockStudyQuestions}
                onQuestionAdded={onQuestionAdded}
              />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
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
              order: mockStudyQuestions.length + 1
            }
          }
        },
        error: new Error('Failed to create')
      }
    ]

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionCreate studyQuestions={mockStudyQuestions} />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
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
