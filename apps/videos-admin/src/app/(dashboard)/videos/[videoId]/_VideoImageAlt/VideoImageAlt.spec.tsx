import { NetworkStatus, useSuspenseQuery } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  CREATE_VIDEO_IMAGE_ALT,
  UPDATE_VIDEO_IMAGE_ALT,
  VideoImageAlt
} from './VideoImageAlt'

// Define local type definitions instead of importing
type VideoImageAlt = {
  id: string
  value: string
  primary?: boolean
  language?: {
    id: string
    name: {
      value: string
    }
  }
}

// Create local mock data
const mockVideoId = '1_jf-0-0'
const mockImageAlt = {
  id: '8cef078b-8fea-6777-d660-d004a0cded70',
  value: 'This is a test image alt',
  primary: true,
  language: {
    id: '529',
    name: {
      value: 'English'
    }
  }
}

// Mock the useSuspenseQuery hook
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: jest.fn()
  }
})

const mockVideoImageAltResult = {
  data: {
    adminVideo: {
      id: mockVideoId,
      imageAlt: [mockImageAlt]
    }
  }
}

const mockCreateVideoImageAlt = {
  request: {
    query: CREATE_VIDEO_IMAGE_ALT,
    variables: {
      input: {
        videoId: mockVideoId,
        value: 'new image alt text',
        primary: true,
        languageId: '529'
      }
    }
  },
  result: {
    data: {
      videoImageAltCreate: {
        id: '8cef078b-8fea-6777-d660-d004a0cded70',
        value: 'new image alt text'
      }
    }
  }
}

describe('VideoImageAlt', () => {
  const mockUpdateVideoImageAlt = {
    request: {
      query: UPDATE_VIDEO_IMAGE_ALT,
      variables: {
        input: {
          id: '8cef078b-8fea-6777-d660-d004a0cded70',
          value: 'new image alt text'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        videoImageAltUpdate: {
          id: '8cef078b-8fea-6777-d660-d004a0cded70',
          value: 'new image alt text'
        }
      }
    }))
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation for useSuspenseQuery
    const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: mockVideoImageAltResult.data,
      fetchMore: jest.fn(),
      subscribeToMore: jest.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: jest.fn()
    })
  })

  test('should show disabled save button by default if values not changed', async () => {
    render(
      <MockedProvider>
        <VideoImageAlt videoId={mockVideoId} />
      </MockedProvider>
    )

    await act(async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
      })
    })
  })

  test('should enable form buttons if image alt has been changed', async () => {
    render(
      <MockedProvider>
        <VideoImageAlt videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Image Accessibility Text')).toHaveValue(
      mockImageAlt.value
    )

    fireEvent.change(screen.getByLabelText('Image Accessibility Text'), {
      target: { value: 'Hello' }
    })

    expect(screen.getByLabelText('Image Accessibility Text')).toHaveValue(
      'Hello'
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  test('should create video image alt if none exists', async () => {
    // Mock empty imageAlt array for this test
    const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: { adminVideo: { id: mockVideoId, imageAlt: [] } },
      fetchMore: jest.fn(),
      subscribeToMore: jest.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: jest.fn()
    })

    const result = jest.fn().mockReturnValue(mockCreateVideoImageAlt.result)

    render(
      <MockedProvider mocks={[{ ...mockCreateVideoImageAlt, result }]}>
        <VideoImageAlt videoId={mockVideoId} />
      </MockedProvider>
    )

    const user = userEvent.setup()
    const textbox = screen.getByLabelText('Image Accessibility Text')
    expect(textbox).toHaveValue('')

    await user.type(textbox, 'new image alt text')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  test('should update video image alt on submit', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoImageAlt]}>
        <VideoImageAlt videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByLabelText('Image Accessibility Text')).toHaveValue(
      mockImageAlt.value
    )

    fireEvent.change(screen.getByLabelText('Image Accessibility Text'), {
      target: { value: 'new image alt text' }
    })

    expect(screen.getByLabelText('Image Accessibility Text')).toHaveValue(
      'new image alt text'
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(mockUpdateVideoImageAlt.result).toHaveBeenCalled()
    )
  })

  test('should require image alt field', async () => {
    render(
      <MockedProvider>
        <VideoImageAlt videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByLabelText('Image Accessibility Text')).toHaveValue(
      mockImageAlt.value
    )

    fireEvent.change(screen.getByLabelText('Image Accessibility Text'), {
      target: { value: '' }
    })

    await waitFor(() =>
      expect(screen.getByText('Image Alt is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  test('should reset form when cancel button is clicked', async () => {
    render(
      <MockedProvider>
        <VideoImageAlt videoId={mockVideoId} />
      </MockedProvider>
    )

    const user = userEvent.setup()
    const textbox = screen.getByLabelText('Image Accessibility Text')
    expect(textbox).toHaveValue(mockImageAlt.value)

    await user.clear(textbox)
    await user.type(textbox, 'Hello')

    expect(screen.getByLabelText('Image Accessibility Text')).toHaveValue(
      'Hello'
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByLabelText('Image Accessibility Text')).toHaveValue(
      mockImageAlt.value
    )
  })
})
