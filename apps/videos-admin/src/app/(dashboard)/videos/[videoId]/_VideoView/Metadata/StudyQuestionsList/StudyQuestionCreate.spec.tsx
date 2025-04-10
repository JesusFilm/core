import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  CREATE_STUDY_QUESTION,
  StudyQuestionCreate
} from './StudyQuestionCreate'
import { GET_STUDY_QUESTIONS } from './StudyQuestionsList'

const videoId = 'video-1'

describe('StudyQuestionCreate', () => {
  it('should render create button', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <StudyQuestionCreate videoId={videoId} order={3} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should open dialog on button click', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <StudyQuestionCreate videoId={videoId} order={3} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should create study question with correct order and trigger refetch', async () => {
    const onQuestionAdded = jest.fn()
    const newQuestionId = 'new-question-123'

    // Create the mocks
    const mocks = [
      {
        request: {
          query: CREATE_STUDY_QUESTION,
          variables: {
            input: {
              videoId,
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
              id: newQuestionId,
              value: 'New question',
              __typename: 'VideoStudyQuestion'
            }
          }
        }
      },
      {
        request: {
          query: GET_STUDY_QUESTIONS,
          variables: { videoId }
        },
        result: {
          data: {
            adminVideo: {
              id: videoId,
              studyQuestions: [
                {
                  id: newQuestionId,
                  value: 'New question',
                  order: 3,
                  __typename: 'VideoStudyQuestion'
                }
              ],
              __typename: 'AdminVideo'
            }
          }
        }
      }
    ]

    render(
      <MockedProvider mocks={mocks} addTypename={true}>
        <SnackbarProvider>
          <StudyQuestionCreate
            videoId={videoId}
            order={3}
            onQuestionAdded={onQuestionAdded}
          />
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
              videoId,
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
          <StudyQuestionCreate videoId={videoId} order={3} />
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
