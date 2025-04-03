import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'

import { SnackbarProvider } from '../../../../../../../../libs/SnackbarProvider'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import {
  EditionEdit,
  UPDATE_VIDEO_EDITION,
  UpdateVideoEdition,
  UpdateVideoEditionVariables
} from './EditionEdit'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']

const editEditionMock: MockedResponse<
  UpdateVideoEdition,
  UpdateVideoEditionVariables
> = {
  request: {
    query: UPDATE_VIDEO_EDITION,
    variables: {
      input: {
        id: 'edition.id',
        name: 'updated edition'
      }
    }
  },
  result: {
    data: {
      videoEditionUpdate: {
        id: 'edition.id',
        name: 'updated edition'
      }
    }
  }
}

describe('EditionEdit', () => {
  it('should render', () => {
    render(
      
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <EditionEdit
              close={jest.fn()}
              edition={mockVideo.videoEditions[0]}
            />
          </VideoProvider>
        </MockedProvider>
      
    )
    const textbox = screen.getByRole('textbox', { name: 'Name' })

    expect(textbox).toBeInTheDocument()
    expect(textbox).toHaveValue(mockVideo.videoEditions[0].name)
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
  })

  it('should update an edition', async () => {
    const close = jest.fn()
    const editEditionMockResult = jest
      .fn()
      .mockReturnValue(editEditionMock.result)

    render(
      
        <SnackbarProvider>
          <MockedProvider
            mocks={[{ ...editEditionMock, result: editEditionMockResult }]}
          >
            <VideoProvider video={mockVideo}>
              <EditionEdit close={close} edition={mockVideo.videoEditions[0]} />
            </VideoProvider>
          </MockedProvider>
        </SnackbarProvider>
      
    )
    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox', { name: 'Name' })

    await user.clear(textbox)
    await user.type(textbox, 'updated edition')
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => {
      expect(editEditionMockResult).toHaveBeenCalled()
    })
    expect(
      screen.getByText('Edition updated successfully.')
    ).toBeInTheDocument()
    expect(close).toHaveBeenCalled()
  })

  it('should handle errors on update', async () => {
    const errorMock = {
      ...editEditionMock,
      result: {
        errors: [
          new GraphQLError('Unexpected error', {
            extensions: { code: 'DOWNSTREAM_SERVICE_ERROR' }
          })
        ]
      }
    }

    render(
      
        <SnackbarProvider>
          <MockedProvider mocks={[errorMock]}>
            <VideoProvider video={mockVideo}>
              <EditionEdit
                close={jest.fn()}
                edition={mockVideo.videoEditions[0]}
              />
            </VideoProvider>
          </MockedProvider>
        </SnackbarProvider>
      
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox', { name: 'Name' })

    await user.clear(textbox)
    await user.type(textbox, 'updated edition')
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    })
  })
})
