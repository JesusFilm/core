import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { NextIntlClientProvider } from 'next-intl'

import { SnackbarProvider } from '../../../../../../../../../libs/SnackbarProvider'
import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../../../libs/VideoProvider'

import {
  CREATE_VIDEO_EDITION,
  CreateVideoEdition,
  CreateVideoEditionVariables,
  EditionCreate
} from './EditionCreate'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']

const createEditionMock: MockedResponse<
  CreateVideoEdition,
  CreateVideoEditionVariables
> = {
  request: {
    query: CREATE_VIDEO_EDITION,
    variables: {
      input: {
        videoId: mockVideo.id,
        name: 'New edition'
      }
    }
  },
  result: {
    data: {
      videoEditionCreate: {
        id: 'edition.id',
        name: 'New edition'
      }
    }
  }
}

describe('EditionCreate', () => {
  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <EditionCreate close={jest.fn()} />
          </VideoProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )
    const textbox = screen.getByRole('textbox', { name: 'Name' })

    expect(textbox).toBeInTheDocument()
    expect(textbox).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('should create an edition', async () => {
    const close = jest.fn()
    const createEditionMockResult = jest
      .fn()
      .mockReturnValue(createEditionMock.result)

    render(
      <NextIntlClientProvider locale="en">
        <SnackbarProvider>
          <MockedProvider
            mocks={[{ ...createEditionMock, result: createEditionMockResult }]}
          >
            <VideoProvider video={mockVideo}>
              <EditionCreate close={close} />
            </VideoProvider>
          </MockedProvider>
        </SnackbarProvider>
      </NextIntlClientProvider>
    )
    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox', { name: 'Name' })

    await user.type(textbox, 'New edition')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createEditionMockResult).toHaveBeenCalled()
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
      <NextIntlClientProvider locale="en">
        <SnackbarProvider>
          <MockedProvider mocks={[errorMock]}>
            <VideoProvider video={mockVideo}>
              <EditionCreate close={jest.fn()} />
            </VideoProvider>
          </MockedProvider>
        </SnackbarProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox', { name: 'Name' })

    await user.type(textbox, 'New edition')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    })
  })
})
