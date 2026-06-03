import { NetworkStatus, useSuspenseQuery } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _unescape from 'lodash/unescape'
import { type MockedFunction } from 'vitest'

import { ResultOf, VariablesOf } from '@core/shared/gql'

import {
  CREATE_VIDEO_DESCRIPTION,
  UPDATE_VIDEO_DESCRIPTION,
  VideoDescription
} from './VideoDescription'

// Mock useSuspenseQuery hook
vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: vi.fn()
  }
})

const mockVideoId = '1_jf-0-0'

const mockVideoDescriptionResult = {
  data: {
    adminVideo: {
      description: [
        {
          id: '6aef078b-6fea-4577-b440-b002a0cdeb58',
          value: 'This is a test description'
        }
      ]
    }
  }
}

const mockCreateVideoDescription: MockedResponse<
  ResultOf<typeof CREATE_VIDEO_DESCRIPTION>,
  VariablesOf<typeof CREATE_VIDEO_DESCRIPTION>
> = {
  request: {
    query: CREATE_VIDEO_DESCRIPTION,
    variables: {
      input: {
        videoId: mockVideoId,
        value: 'new description text',
        primary: true,
        languageId: '529'
      }
    }
  },
  result: {
    data: {
      videoDescriptionCreate: {
        id: '6aef078b-6fea-4577-b440-b002a0cdeb58',
        value: 'new description text'
      }
    }
  }
}

describe('VideoDescription', () => {
  const mockUpdateVideoDescription = {
    request: {
      query: UPDATE_VIDEO_DESCRIPTION,
      variables: {
        input: {
          id: '6aef078b-6fea-4577-b440-b002a0cdeb58',
          value: 'new description text'
        }
      }
    },
    result: vi.fn(() => ({
      data: {
        videoDescriptionUpdate: {
          id: '6aef078b-6fea-4577-b440-b002a0cdeb58',
          value: 'new description text'
        }
      }
    }))
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementation for useSuspenseQuery
    const mockedUseSuspenseQuery = useSuspenseQuery as MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: mockVideoDescriptionResult.data,
      fetchMore: vi.fn(),
      subscribeToMore: vi.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: vi.fn()
    })
  })

  test('should show disabled save button by default when values are not changed', async () => {
    render(
      <MockedProvider>
        <VideoDescription videoId={mockVideoId} />
      </MockedProvider>
    )

    await act(async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
      })
    })
  })

  test('should enable form buttons if description has been changed', async () => {
    render(
      <MockedProvider>
        <VideoDescription videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(
        mockVideoDescriptionResult.data.adminVideo.description[0].value
      ).replace(/&#13;/g, '\n')
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  test('should create video description if none exists', async () => {
    // Mock empty description array for this test
    const mockedUseSuspenseQuery = useSuspenseQuery as MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: { adminVideo: { description: [] } },
      fetchMore: vi.fn(),
      subscribeToMore: vi.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: vi.fn()
    })

    const result = vi.fn().mockReturnValue(mockCreateVideoDescription.result)

    render(
      <MockedProvider
        mocks={[
          { ...mockCreateVideoDescription, result },
          mockUpdateVideoDescription
        ]}
      >
        <VideoDescription videoId={mockVideoId} />
      </MockedProvider>
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox')
    expect(screen.getByRole('textbox')).toHaveValue('')
    await user.type(textbox, 'new description text')

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockUpdateVideoDescription.result).not.toHaveBeenCalled()
  })

  test('should update video description on submit', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoDescription]}>
        <VideoDescription videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(
        mockVideoDescriptionResult.data.adminVideo.description[0].value
      ).replace(/&#13;/g, '\n')
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new description text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('new description text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoDescription.result).toHaveBeenCalled()
    )
  })

  test('should require description field', async () => {
    render(
      <MockedProvider>
        <VideoDescription videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(
        mockVideoDescriptionResult.data.adminVideo.description[0].value
      ).replace(/&#13;/g, '\n')
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  test('should reset form when cancel is clicked', async () => {
    render(
      <MockedProvider>
        <VideoDescription videoId={mockVideoId} />
      </MockedProvider>
    )
    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox')

    expect(textbox).toHaveValue(
      _unescape(
        mockVideoDescriptionResult.data.adminVideo.description[0].value
      ).replace(/&#13;/g, '\n')
    )

    await user.clear(textbox)
    await user.type(textbox, 'Hello')

    expect(screen.getByRole('textbox')).toHaveValue('Hello')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(
        mockVideoDescriptionResult.data.adminVideo.description[0].value
      ).replace(/&#13;/g, '\n')
    )
  })
})
