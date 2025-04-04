import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'

import { SnackbarProvider } from '../../../../../libs/SnackbarProvider'
import { getCreateEditionMock } from '../../../../../libs/useCreateEdition/useCreateEdition.mock'

import {
  CREATE_VIDEO,
  CreateVideo,
  CreateVideoVariables,
  VideoCreateForm
} from './VideoCreateForm'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: jest.fn(),
  usePathname: jest.fn()
}))

const mockUseRouter = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockUseRouter }),
  usePathname: () => '/videos'
}))

const createVideoMock: MockedResponse<CreateVideo, CreateVideoVariables> = {
  request: {
    query: CREATE_VIDEO,
    variables: {
      input: {
        id: 'test_video',
        slug: 'test_video_slug',
        label: 'shortFilm',
        primaryLanguageId: '529',
        published: false,
        noIndex: false,
        childIds: []
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      videoCreate: {
        id: 'test_video'
      }
    }
  }))
}
const createEditionMock = getCreateEditionMock({
  videoId: 'test_video',
  name: 'base'
})

describe('VideoCreateForm', () => {
  const mockCancel = jest.fn()

  it('should render form', () => {
    render(
      <MockedProvider>
        <VideoCreateForm close={mockCancel} />
      </MockedProvider>
    )

    expect(screen.getByRole('textbox', { name: 'ID' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Slug' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Label' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('should emit cancel callback on cancel', async () => {
    render(
      <MockedProvider>
        <VideoCreateForm close={mockCancel} />
      </MockedProvider>
    )

    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockCancel).toHaveBeenCalled()
  })

  it('should require all fields', async () => {
    render(
      <MockedProvider>
        <VideoCreateForm close={mockCancel} />
      </MockedProvider>
    )

    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByText('ID is required')).toBeInTheDocument()
    expect(screen.getByText('Slug is required')).toBeInTheDocument()
    expect(screen.getByText('Label is required')).toBeInTheDocument()
  })

  it('should create a video', async () => {
    render(
      <MockedProvider mocks={[createVideoMock, createEditionMock]}>
        <VideoCreateForm close={mockCancel} />
      </MockedProvider>
    )

    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: 'ID' }), 'test_video')
    await user.type(
      screen.getByRole('textbox', { name: 'Slug' }),
      'test_video_slug'
    )

    await user.click(screen.getByRole('combobox', { name: 'Label' }))
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'Short Film' }))
    })

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createVideoMock.result).toHaveBeenCalled()
    })
    expect(createEditionMock.result).toHaveBeenCalled()
    expect(mockUseRouter).toHaveBeenCalledWith('/videos/test_video')
  })

  it('should handle video creation error', async () => {
    const errorMock = {
      ...createVideoMock,
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
          <VideoCreateForm close={mockCancel} />
        </MockedProvider>
      </SnackbarProvider>
    )

    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: 'ID' }), 'test_video')
    await user.type(
      screen.getByRole('textbox', { name: 'Slug' }),
      'test_video_slug'
    )

    await user.click(screen.getByRole('combobox', { name: 'Label' }))
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'Short Film' }))
    })

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    })
  })
})
