import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import {
  CREATE_STUDY_QUESTION,
  StudyQuestionCreate
} from './StudyQuestionCreate'

const video = {
  id: 'video-1',
  title: [{ value: 'Test Video', primary: true }]
}

const mockStudyQuestions = [
  { id: '1', value: 'Question 1' },
  { id: '2', value: 'Question 2' }
]

describe('StudyQuestionCreate', () => {
  const handleQuestionCreated = jest.fn()

  it('should render create button', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider value={video}>
              <StudyQuestionCreate
                studyQuestions={mockStudyQuestions}
                onQuestionCreated={handleQuestionCreated}
              />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should open dialog on button click', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider value={video}>
              <StudyQuestionCreate
                studyQuestions={mockStudyQuestions}
                onQuestionCreated={handleQuestionCreated}
              />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should create study question with correct order', async () => {
    const nextOrder = mockStudyQuestions.length + 1
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
              value: 'New question'
            }
          }
        }
      }
    ]

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={mocks} addTypename={false}>
          <SnackbarProvider>
            <VideoProvider value={video}>
              <StudyQuestionCreate
                studyQuestions={mockStudyQuestions}
                onQuestionCreated={handleQuestionCreated}
              />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByText('Add'))
    fireEvent.change(screen.getByLabelText('Study Question'), {
      target: { value: 'New question' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(screen.getByText('Study question created')).toBeInTheDocument()
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(handleQuestionCreated).toHaveBeenCalledWith({
      id: '3',
      value: 'New question'
    })
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
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={mocks} addTypename={false}>
          <SnackbarProvider>
            <VideoProvider value={video}>
              <StudyQuestionCreate
                studyQuestions={mockStudyQuestions}
                onQuestionCreated={handleQuestionCreated}
              />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByText('Add'))
    fireEvent.change(screen.getByLabelText('Study Question'), {
      target: { value: 'New question' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to create')).toBeInTheDocument()
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
