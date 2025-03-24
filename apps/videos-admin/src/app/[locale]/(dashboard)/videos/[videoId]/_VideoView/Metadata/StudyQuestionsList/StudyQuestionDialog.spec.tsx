import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import {
  StudyQuestionDialog,
  UPDATE_STUDY_QUESTION
} from './StudyQuestionDialog'

const video = {
  id: 'video-1',
  title: [{ value: 'Test Video', primary: true }]
}

describe('StudyQuestionDialog', () => {
  it('should render dialog', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider value={video}>
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
    expect(screen.getByLabelText('Study Question')).toHaveValue('Test question')
  })

  it('should update study question', async () => {
    const onClose = jest.fn()
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
              value: 'Updated question'
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
              <StudyQuestionDialog
                open={true}
                onClose={onClose}
                studyQuestion={{ id: '1', value: 'Test question' }}
              />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.change(screen.getByLabelText('Study Question'), {
      target: { value: 'Updated question' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Study question updated')).toBeInTheDocument()
    })
    expect(onClose).toHaveBeenCalled()
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
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={mocks} addTypename={false}>
          <SnackbarProvider>
            <VideoProvider value={video}>
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

    fireEvent.change(screen.getByLabelText('Study Question'), {
      target: { value: 'Updated question' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to update')).toBeInTheDocument()
    })
  })
})
