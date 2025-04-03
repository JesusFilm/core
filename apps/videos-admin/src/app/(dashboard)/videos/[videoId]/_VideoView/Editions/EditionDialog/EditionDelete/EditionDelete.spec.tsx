import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { NextIntlClientProvider } from 'next-intl'

import { SnackbarProvider } from '../../../../../../../../libs/SnackbarProvider'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import {
  DELETE_VIDEO_EDITION,
  DeleteVideoEdition,
  DeleteVideoEditionVariables,
  EditionDelete
} from './EditionDelete'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']

const deleteEditionMock: MockedResponse<
  DeleteVideoEdition,
  DeleteVideoEditionVariables
> = {
  request: {
    query: DELETE_VIDEO_EDITION,
    variables: { id: 'edition.id' }
  },
  result: {
    data: {
      videoEditionDelete: {
        id: 'edition.id'
      }
    }
  }
}

describe('EditionDelete', () => {
  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <EditionDelete
              close={jest.fn()}
              edition={mockVideo.videoEditions[0]}
            />
          </VideoProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(
      screen.getByText('Are you sure you want to delete this edition?')
    ).toBeInTheDocument()
    expect(
      screen.getByText('This action cannot be undone.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('should delete an edition', async () => {
    const close = jest.fn()
    const deleteEditionMockResult = jest
      .fn()
      .mockReturnValue(deleteEditionMock.result)

    render(
      <NextIntlClientProvider locale="en">
        <SnackbarProvider>
          <MockedProvider
            mocks={[{ ...deleteEditionMock, result: deleteEditionMockResult }]}
          >
            <VideoProvider video={mockVideo}>
              <EditionDelete
                close={close}
                edition={mockVideo.videoEditions[0]}
              />
            </VideoProvider>
          </MockedProvider>
        </SnackbarProvider>
      </NextIntlClientProvider>
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(deleteEditionMockResult).toHaveBeenCalled()
    })
    expect(
      screen.getByText('Edition deleted successfully.')
    ).toBeInTheDocument()
    expect(close).toHaveBeenCalled()
  })

  it('should handle errors on delete', async () => {
    const errorMock = {
      ...deleteEditionMock,
      result: {
        errors: [
          new GraphQLError('Unexpected error', {
            extensions: { code: 'DOWNSTREAM_SERVICE_ERROR' }
          })
        ]
      }
    }

    render(
      <NextIntlClientProvider locale="en">
        <SnackbarProvider>
          <MockedProvider mocks={[errorMock]}>
            <VideoProvider video={mockVideo}>
              <EditionDelete
                close={jest.fn()}
                edition={mockVideo.videoEditions[0]}
              />
            </VideoProvider>
          </MockedProvider>
        </SnackbarProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    })
  })

  it('should call the close callback', async () => {
    const close = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <EditionDelete close={close} edition={mockVideo.videoEditions[0]} />
          </VideoProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(close).toHaveBeenCalled()
  })
})
