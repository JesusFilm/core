import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'

import { SnackbarProvider } from '../../../../../../../../libs/SnackbarProvider'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { getCreateEditionMock } from '../../../../../../../../libs/useCreateEdition/useCreateEdition.mock'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import { EditionCreate } from './EditionCreate'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']

const createEditionMock = getCreateEditionMock({
  videoId: mockVideo.id,
  name: 'New edition'
})

describe('EditionCreate', () => {
  it('should render', () => {
    render(
      
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <EditionCreate close={jest.fn()} />
          </VideoProvider>
        </MockedProvider>
      
    )
    const textbox = screen.getByRole('textbox', { name: 'Name' })

    expect(textbox).toBeInTheDocument()
    expect(textbox).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('should create an edition', async () => {
    const close = jest.fn()

    render(
      
        <SnackbarProvider>
          <MockedProvider mocks={[createEditionMock]}>
            <VideoProvider video={mockVideo}>
              <EditionCreate close={close} />
            </VideoProvider>
          </MockedProvider>
        </SnackbarProvider>
      
    )
    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox', { name: 'Name' })

    await user.type(textbox, 'New edition')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createEditionMock.result).toHaveBeenCalled()
    })
    expect(
      screen.getByText('Successfully created edition.')
    ).toBeInTheDocument()
    expect(close).toHaveBeenCalled()
  })

  it('should handle errors on create', async () => {
    const errorMock = {
      ...createEditionMock,
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
              <EditionCreate close={jest.fn()} />
            </VideoProvider>
          </MockedProvider>
        </SnackbarProvider>
      
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox', { name: 'Name' })

    await user.type(textbox, 'New edition')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to create edition.')).toBeInTheDocument()
    })
  })
})
