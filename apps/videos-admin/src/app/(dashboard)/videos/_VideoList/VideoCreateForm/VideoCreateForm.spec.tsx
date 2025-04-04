import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
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

  it('should render form', () => {
    render(
      <MockedProvider>
        <VideoCreateForm close={mockCancel} />
      </MockedProvider>
    )

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
    expect(screen.getByText('Primary language is required')).toBeInTheDocument()
  })

  it('should create a video', async () => {
    const getLanguagesMockResult = jest
      .fn()
      .mockReturnValue(getLanguagesMock.result)

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

    await user.click(screen.getByRole('combobox', { name: 'Primary Language' }))
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'English' }))
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
        <MockedProvider mocks={[getLanguagesMock, errorMock]}>
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

    await user.click(screen.getByRole('combobox', { name: 'Primary Language' }))
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'English' }))
    })

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    })
  })

  it('should show parent ID message when parentId is provided', async () => {
    render(
      <MockedProvider>
        <VideoCreateForm close={mockCancel} parentId="parent_video_id" />
      </MockedProvider>
    )

    expect(
      screen.getByText(
        'This video will be added as a child to video with ID: parent_video_id'
      )
    ).toBeInTheDocument()
  })

  it('should call onCreateSuccess callback instead of router navigation when provided', async () => {
    const onCreateSuccessMock = jest.fn()
    const getLanguagesMockResult = jest
      .fn()
      .mockReturnValue(getLanguagesMock.result)

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

    await user.click(screen.getByRole('combobox', { name: 'Primary Language' }))
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'English' }))
    })

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createVideoMock.result).toHaveBeenCalled()
    })
    expect(createEditionMock.result).toHaveBeenCalled()
    expect(onCreateSuccessMock).toHaveBeenCalledWith('test_video')
    expect(mockUseRouter).not.toHaveBeenCalled()
  })

  it('should auto-select suggested label based on parent video type', async () => {
    render(
      <MockedProvider mocks={[getParentVideoLabelMock]}>
        <VideoCreateForm close={mockCancel} parentId="parent_video_id" />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          "Based on the parent Collection, we've suggested Episode"
        )
      ).toBeInTheDocument()
    })
  })
})
