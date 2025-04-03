import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { GET_ADMIN_VIDEO } from '../../../../../../../../libs/useAdminVideo'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import {
  StudyQuestionDialog,
  UPDATE_STUDY_QUESTION
} from './StudyQuestionDialog'

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
  'Edit Study Question': 'Edit Study Question',
  'Study Question': 'Study Question',
  'Enter study question': 'Enter study question',
  Update: 'Update',
  'Study question is required': 'Study question is required',
  'Study question updated': 'Study question updated',
  'Failed to update': 'Failed to update',
  Save: 'Save'
}

const video = {
  id: 'video-1',
  title: [{ id: '1', value: 'Test Video', primary: true }],
  slug: 'test-video',
  published: true,
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
  videoEditions: [],
  label: VideoLabel.featureFilm
}

describe('StudyQuestionDialog', () => {
  it('should render dialog', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionDialog
                open={true}
                onClose={jest.fn()}
                studyQuestion={{ id: '1', value: 'Test question' }}
              />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Edit Study Question')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter study question')).toHaveValue(
      'Test question'
    )
  })

  it('should update study question and trigger callback', async () => {
    const onClose = jest.fn()
    const onQuestionUpdated = jest.fn()

    // Create the proper mocked response
    const mocks = [
      {
        request: {
          query: UPDATE_STUDY_QUESTION,
          variables: {
            input: {
              id: '1',
              value: 'Updated question'
            }
          }
        },
        result: {
          data: {
            videoStudyQuestionUpdate: {
              id: '1',
              value: 'Updated question',
              __typename: 'VideoStudyQuestion'
            }
          }
        }
      },
      {
        request: {
          query: GET_ADMIN_VIDEO,
          variables: { videoId: 'video-1' }
        },
        result: {
          data: {
            adminVideo: {
              ...video,
              studyQuestions: [
                {
                  id: '1',
                  value: 'Updated question',
                  __typename: 'VideoStudyQuestion'
                }
              ]
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
              <StudyQuestionDialog
                open={true}
                onClose={onClose}
                studyQuestion={{ id: '1', value: 'Test question' }}
                onQuestionUpdated={onQuestionUpdated}
              />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Update the study question
    fireEvent.change(screen.getByPlaceholderText('Enter study question'), {
      target: { value: 'Updated question' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update' }))

    // Verify the component shows success message and calls onClose
    await waitFor(() => {
      expect(screen.getByText('Study question updated')).toBeInTheDocument()
    })
    expect(onClose).toHaveBeenCalled()
    expect(onQuestionUpdated).toHaveBeenCalled()
  })

  it('should handle error', async () => {
    const mocks = [
      {
        request: {
          query: UPDATE_STUDY_QUESTION,
          variables: {
            input: {
              id: '1',
              value: 'Updated question'
            }
          }
        },
        error: new Error('Failed to update')
      }
    ]

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionDialog
                open={true}
                onClose={jest.fn()}
                studyQuestion={{ id: '1', value: 'Test question' }}
              />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.change(screen.getByPlaceholderText('Enter study question'), {
      target: { value: 'Updated question' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to update')).toBeInTheDocument()
    })
  })
})
