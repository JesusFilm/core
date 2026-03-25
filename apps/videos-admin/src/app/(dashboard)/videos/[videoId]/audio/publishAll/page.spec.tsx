import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import PublishAllAudioDialog from './page'

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockEnqueueSnackbar = jest.fn()
const mockPublishVariantsOnly = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh
  })
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: jest.fn(),
    useMutation: jest.fn()
  }
})

describe('PublishAllAudioDialog (route)', () => {
  const { useSuspenseQuery, useMutation } = jest.requireMock('@apollo/client')

  beforeEach(() => {
    jest.clearAllMocks()

    useSuspenseQuery.mockReturnValue({
      data: {
        adminVideo: {
          id: 'video123',
          variants: [
            { id: 'v1', published: false },
            { id: 'v2', published: true },
            { id: 'v3', published: false }
          ]
        }
      }
    })
    mockPublishVariantsOnly.mockResolvedValue({
      data: { videoPublishChildren: { publishedVariantsCount: 2 } }
    })
    ;(useMutation as jest.Mock).mockReturnValue([mockPublishVariantsOnly, {}])
  })

  it('renders dialog and confirms', () => {
    render(
      <MockedProvider>
        <PublishAllAudioDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    expect(
      screen.getByText('Publish All Draft Audio Languages')
    ).toBeInTheDocument()
    expect(screen.getByText('Publish All')).toBeInTheDocument()
  })

  it('publishes all draft variants on confirm', async () => {
    render(
      <MockedProvider>
        <PublishAllAudioDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Publish All'))

    await waitFor(() => {
      expect(mockPublishVariantsOnly).toHaveBeenCalledWith({
        variables: {
          id: 'video123',
          mode: 'variantsOnly',
          dryRun: false
        }
      })
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Successfully published 2 draft audio language variant(s)',
        { variant: 'success' }
      )
      expect(mockPush).toHaveBeenCalledWith('/videos/video123/audio', {
        scroll: false
      })
    })
  })

  it('cancels and returns to audio tab', () => {
    render(
      <MockedProvider>
        <PublishAllAudioDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockPush).toHaveBeenCalledWith('/videos/video123/audio', {
      scroll: false
    })
  })

  it('shows info and redirects when no drafts', async () => {
    useSuspenseQuery.mockReturnValueOnce({
      data: { adminVideo: { id: 'video123', variants: [] } }
    })

    render(
      <MockedProvider>
        <PublishAllAudioDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'No draft audio languages to publish',
        { variant: 'info' }
      )
      expect(mockPush).toHaveBeenCalledWith('/videos/video123/audio', {
        scroll: false
      })
    })
  })
})
