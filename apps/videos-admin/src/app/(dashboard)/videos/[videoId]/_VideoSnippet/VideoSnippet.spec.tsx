import { NetworkStatus, useSuspenseQuery } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultOf, VariablesOf } from 'gql.tada'
import _unescape from 'lodash/unescape'
import { SnackbarProvider } from 'notistack'

import {
  CREATE_VIDEO_SNIPPET,
  UPDATE_VIDEO_SNIPPET,
  VideoSnippet
} from './VideoSnippet'

// Mock useSuspenseQuery hook
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: jest.fn()
  }
})

const mockVideoId = '1_jf-0-0'

const mockVideoSnippetResult = {
  data: {
    adminVideo: {
      snippet: [
        {
          id: 'e3645175-c05b-4760-a0ac-fdcb894655be',
          value:
            'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
        }
      ]
    }
  }
}

const mockCreateVideoSnippet: MockedResponse<
  ResultOf<typeof CREATE_VIDEO_SNIPPET>,
  VariablesOf<typeof CREATE_VIDEO_SNIPPET>
> = {
  request: {
    query: CREATE_VIDEO_SNIPPET,
    variables: {
      input: {
        videoId: mockVideoId,
        value: 'new snippet text',
        primary: true,
        languageId: '529'
      }
    }
  },
  result: {
    data: {
      videoSnippetCreate: {
        id: 'snippet.id',
        value: 'new snippet text'
      }
    }
  }
}

describe('VideoSnippet', () => {
  const mockUpdateVideoSnippet = {
    request: {
      query: UPDATE_VIDEO_SNIPPET,
      variables: {
        input: {
          id: 'e3645175-c05b-4760-a0ac-fdcb894655be',
          value: 'new snippet text'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        videoSnippetUpdate: {
          id: 'e3645175-c05b-4760-a0ac-fdcb894655be',
          value: 'new snippet text'
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
      data: mockVideoSnippetResult.data,
      fetchMore: jest.fn(),
      subscribeToMore: jest.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: jest.fn()
    })
  })

  it('should show disabled save button when values have not been changed', async () => {
    render(
      <MockedProvider>
        <VideoSnippet videoId={mockVideoId} />
      </MockedProvider>
    )

    await act(async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
      })
    })
  })

  it('should enable form buttons if snippet has been changed', async () => {
    render(
      <MockedProvider>
        <VideoSnippet videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(
        mockVideoSnippetResult.data.adminVideo.snippet[0].value
      ).replace(/&#13;/g, '\n')
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should create video snippet if none exists', async () => {
    // Mock empty snippet array for this test
    const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: { adminVideo: { snippet: [] } },
      fetchMore: jest.fn(),
      subscribeToMore: jest.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: jest.fn()
    })

    const result = jest.fn().mockReturnValue(mockCreateVideoSnippet.result)

    render(
      <MockedProvider mocks={[{ ...mockCreateVideoSnippet, result }]}>
        <SnackbarProvider>
          <VideoSnippet videoId={mockVideoId} />
        </SnackbarProvider>
      </MockedProvider>
    )

    const user = userEvent.setup()

    expect(screen.getByRole('textbox')).toHaveValue('')
    await user.type(screen.getByRole('textbox'), 'new snippet text')

    expect(screen.getByRole('textbox')).toHaveValue('new snippet text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockUpdateVideoSnippet.result).not.toHaveBeenCalled()
    expect(
      screen.getByText('Video short description created')
    ).toBeInTheDocument()
  })

  it('should update video snippet on submit', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoSnippet]}>
        <SnackbarProvider>
          <VideoSnippet videoId={mockVideoId} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(
        mockVideoSnippetResult.data.adminVideo.snippet[0].value
      ).replace(/&#13;/g, '\n')
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new snippet text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('new snippet text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoSnippet.result).toHaveBeenCalled()
    )
    expect(
      screen.getByText('Video short description updated')
    ).toBeInTheDocument()
  })

  it('should require snippet field', async () => {
    render(
      <MockedProvider>
        <VideoSnippet videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(
        mockVideoSnippetResult.data.adminVideo.snippet[0].value
      ).replace(/&#13;/g, '\n')
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Snippet is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should reset form when cancel is clicked', async () => {
    render(
      <MockedProvider>
        <VideoSnippet videoId={mockVideoId} />
      </MockedProvider>
    )

    const user = userEvent.setup()
    const textbox = screen.getByRole('textbox')

    expect(textbox).toHaveValue(
      _unescape(
        mockVideoSnippetResult.data.adminVideo.snippet[0].value
      ).replace(/&#13;/g, '\n')
    )

    await user.clear(textbox)
    await user.type(textbox, 'Hello')
    expect(screen.getByRole('textbox')).toHaveValue('Hello')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(textbox).toHaveValue(
      _unescape(
        mockVideoSnippetResult.data.adminVideo.snippet[0].value
      ).replace(/&#13;/g, '\n')
    )
  })
})
