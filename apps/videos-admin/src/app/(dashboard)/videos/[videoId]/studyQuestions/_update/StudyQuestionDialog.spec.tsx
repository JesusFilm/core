import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GET_STUDY_QUESTIONS } from '../StudyQuestionsList'
import { mockStudyQuestions } from '../StudyQuestions.mock'

import {
  StudyQuestionDialog,
  UPDATE_STUDY_QUESTION
} from './StudyQuestionDialog'

const videoId = 'video-1'

describe('StudyQuestionDialog', () => {
  it('should render dialog', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <StudyQuestionDialog
            open={true}
            onClose={jest.fn()}
            studyQuestion={{ id: '1', value: 'Test question' }}
            videoId={videoId}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Edit Study Question')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter study question')).toHaveValue(
      'Test question'
    )
  })

  it('should update study question and trigger callback', async () => {
    const onClose = jest.fn()
    const onQuestionUpdated = jest.fn()

    // Define the updated question
    const updatedQuestion = {
      id: mockStudyQuestions[0].id,
      value: 'Updated question',
      order: 1,
      __typename: 'VideoStudyQuestion'
    }

    // Create the proper mocked response
    const mocks = [
      {
        request: {
          query: UPDATE_STUDY_QUESTION,
          variables: {
            input: {
              id: mockStudyQuestions[0].id,
              value: 'Updated question'
            }
          }
        },
        result: {
          data: {
            videoStudyQuestionUpdate: {
              id: mockStudyQuestions[0].id,
              value: 'Updated question',
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
              studyQuestions: [updatedQuestion, ...mockStudyQuestions.slice(1)],
              __typename: 'AdminVideo'
            }
          }
        }
      }
    ]

    render(
      <MockedProvider mocks={mocks} addTypename={true}>
        <SnackbarProvider>
          <StudyQuestionDialog
            open={true}
            onClose={onClose}
            studyQuestion={{
              id: mockStudyQuestions[0].id,
              value: 'Test question'
            }}
            onQuestionUpdated={onQuestionUpdated}
            videoId={videoId}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    // Update the study question
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Enter study question'), {
        target: { value: 'Updated question' }
      })
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Update' }))
    })

    // Wait for the mutation to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // Verify the component shows success message and calls onClose
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
              id: mockStudyQuestions[0].id,
              value: 'Updated question'
            }
          }
        },
        error: new Error('Failed to update')
      }
    ]

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SnackbarProvider>
          <StudyQuestionDialog
            open={true}
            onClose={jest.fn()}
            studyQuestion={{
              id: mockStudyQuestions[0].id,
              value: 'Test question'
            }}
            videoId={videoId}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Enter study question'), {
        target: { value: 'Updated question' }
      })
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Update' }))
    })

    // Wait for the error to be displayed
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(screen.getByText('Failed to update')).toBeInTheDocument()
  })
})
