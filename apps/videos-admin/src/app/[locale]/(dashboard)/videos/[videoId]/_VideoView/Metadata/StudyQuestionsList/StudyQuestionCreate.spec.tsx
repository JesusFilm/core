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

describe('StudyQuestionCreate', () => {
  it('should render create button', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider value={video}>
              <StudyQuestionCreate />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Add Study Question')).toBeInTheDocument()
  })

  it('should open dialog on button click', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider value={video}>
              <StudyQuestionCreate />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByText('Add Study Question'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should create study question', async () => {
    const mocks = [
      {
        request: {
          query: CREATE_STUDY_QUESTION,
          variables: {
            input: {
              videoId: 'video-1',
              value: 'New question'
            }
          }
        },
        result: {
          data: {
            videoStudyQuestionCreate: {
              id: '1',
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
              <StudyQuestionCreate />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByText('Add Study Question'))
    fireEvent.change(screen.getByLabelText('Study Question'), {
      target: { value: 'New question' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(screen.getByText('Study question created')).toBeInTheDocument()
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should handle error', async () => {
    const mocks = [
      {
        request: {
          query: CREATE_STUDY_QUESTION,
          variables: {
            input: {
              videoId: 'video-1',
              value: 'New question'
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
              <StudyQuestionCreate />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByText('Add Study Question'))
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
