import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'

import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { SnackbarProvider } from '../../../../../libs/SnackbarProvider'
import { getCreateEditionMock } from '../../../../../libs/useCreateEdition/useCreateEdition.mock'

import {
  CREATE_VIDEO,
  CreateVideo,
  CreateVideoVariables,
  GET_PARENT_VIDEO_LABEL,
  VideoCreateForm
} from './VideoCreateForm'

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

const getParentVideoLabelMock = {
  request: {
    query: GET_PARENT_VIDEO_LABEL,
    variables: {
      videoId: 'parent_video_id'
    }
  },
  result: {
    data: {
      adminVideo: {
        id: 'parent_video_id',
        label: 'collection'
      }
    }
  }
}

const createEditionMock = getCreateEditionMock({
  videoId: 'test_video',
  name: 'base'
})

describe('VideoCreateForm', () => {
  const mockCancel = jest.fn()

  beforeEach(() => {
    mockUseRouter.mockClear()
    mockCancel.mockClear()
    if (typeof createVideoMock.result === 'function') {
      jest.clearAllMocks()
    }
  })

  it('should render form', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <VideoCreateForm close={mockCancel} />
        </MockedProvider>
      )
    })

    expect(screen.getByRole('textbox', { name: 'ID' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Slug' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Label' })).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Primary Language' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('should emit cancel callback on cancel', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <VideoCreateForm close={mockCancel} />
        </MockedProvider>
      )
    })

    const user = userEvent.setup()

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
    })

    expect(mockCancel).toHaveBeenCalled()
  })

  it('should require all fields', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <VideoCreateForm close={mockCancel} />
        </MockedProvider>
      )
    })

    const user = userEvent.setup()

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Create' }))
    })

    // Allow time for validation errors to appear
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(screen.getByText('ID is required')).toBeInTheDocument()
    expect(screen.getByText('Slug is required')).toBeInTheDocument()
    expect(screen.getByText('Label is required')).toBeInTheDocument()
    expect(screen.getByText('Primary language is required')).toBeInTheDocument()
  })

  it('should successfully create a video and navigate to the video page', async () => {
    const getLanguagesMockResult = jest
      .fn()
      .mockReturnValue(getLanguagesMock.result)

    await act(async () => {
      render(
        <MockedProvider
          mocks={[
            { ...getLanguagesMock, result: getLanguagesMockResult },
            createVideoMock,
            createEditionMock
          ]}
        >
          <VideoCreateForm close={mockCancel} />
        </MockedProvider>
      )
    })

    const user = userEvent.setup()

    // Fill in form fields
    await act(async () => {
      await user.type(screen.getByRole('textbox', { name: 'ID' }), 'test_video')
    })

    await act(async () => {
      await user.type(
        screen.getByRole('textbox', { name: 'Slug' }),
        'test_video_slug'
      )
    })

    await act(async () => {
      await user.click(screen.getByRole('combobox', { name: 'Label' }))
    })

    // Allow time for dropdown to open
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    await act(async () => {
      await user.click(screen.getByRole('option', { name: 'Short Film' }))
    })

    await act(async () => {
      await user.click(
        screen.getByRole('combobox', { name: 'Primary Language' })
      )
    })

    // Allow time for dropdown to open
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    await act(async () => {
      await user.click(screen.getByRole('option', { name: 'English' }))
    })

    // Submit the form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Create' }))
    })

    // Allow time for mutations to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    expect(createVideoMock.result).toHaveBeenCalled()
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

    await act(async () => {
      render(
        <SnackbarProvider>
          <MockedProvider mocks={[getLanguagesMock, errorMock]}>
            <VideoCreateForm close={mockCancel} />
          </MockedProvider>
        </SnackbarProvider>
      )
    })

    const user = userEvent.setup()

    // Fill in form fields
    await act(async () => {
      await user.type(screen.getByRole('textbox', { name: 'ID' }), 'test_video')
    })

    await act(async () => {
      await user.type(
        screen.getByRole('textbox', { name: 'Slug' }),
        'test_video_slug'
      )
    })

    await act(async () => {
      await user.click(screen.getByRole('combobox', { name: 'Label' }))
    })

    // Allow time for dropdown to open
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    await act(async () => {
      await user.click(screen.getByRole('option', { name: 'Short Film' }))
    })

    await act(async () => {
      await user.click(
        screen.getByRole('combobox', { name: 'Primary Language' })
      )
    })

    // Allow time for dropdown to open
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    await act(async () => {
      await user.click(screen.getByRole('option', { name: 'English' }))
    })

    // Submit the form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Create' }))
    })

    // Allow time for error to be displayed
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
  })

  it('should show parent ID message when parentId is provided', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[getParentVideoLabelMock]}>
          <VideoCreateForm close={mockCancel} parentId="parent_video_id" />
        </MockedProvider>
      )
    })

    // Allow time for the query to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(
      screen.getByText(
        'This video will be added as a child to video with ID: parent_video_id'
      )
    ).toBeInTheDocument()
  })

  it('should use onCreateSuccess callback instead of router navigation when the callback is provided', async () => {
    const onCreateSuccessMock = jest.fn()
    const getLanguagesMockResult = jest
      .fn()
      .mockReturnValue(getLanguagesMock.result)

    await act(async () => {
      render(
        <MockedProvider
          mocks={[
            { ...getLanguagesMock, result: getLanguagesMockResult },
            createVideoMock,
            createEditionMock
          ]}
        >
          <VideoCreateForm
            close={mockCancel}
            onCreateSuccess={onCreateSuccessMock}
          />
        </MockedProvider>
      )
    })

    const user = userEvent.setup()

    // Fill in form fields
    await act(async () => {
      await user.type(screen.getByRole('textbox', { name: 'ID' }), 'test_video')
    })

    await act(async () => {
      await user.type(
        screen.getByRole('textbox', { name: 'Slug' }),
        'test_video_slug'
      )
    })

    await act(async () => {
      await user.click(screen.getByRole('combobox', { name: 'Label' }))
    })

    // Allow time for dropdown to open
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    await act(async () => {
      await user.click(screen.getByRole('option', { name: 'Short Film' }))
    })

    await act(async () => {
      await user.click(
        screen.getByRole('combobox', { name: 'Primary Language' })
      )
    })

    // Allow time for dropdown to open
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    await act(async () => {
      await user.click(screen.getByRole('option', { name: 'English' }))
    })

    // Submit the form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Create' }))
    })

    // Allow time for mutations to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    expect(createVideoMock.result).toHaveBeenCalled()
    expect(createEditionMock.result).toHaveBeenCalled()
    expect(onCreateSuccessMock).toHaveBeenCalledWith('test_video')
    expect(mockUseRouter).not.toHaveBeenCalled()
  })

  it('should auto-select suggested label based on parent video type', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[getParentVideoLabelMock]}>
          <VideoCreateForm close={mockCancel} parentId="parent_video_id" />
        </MockedProvider>
      )
    })

    // Allow time for the query to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(
      screen.getByText(
        "Based on the parent Collection, we've suggested Episode"
      )
    ).toBeInTheDocument()
  })
})
