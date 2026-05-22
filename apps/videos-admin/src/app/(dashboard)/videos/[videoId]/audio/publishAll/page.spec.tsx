import { useMutation as apolloClient_useMutation, useSuspenseQuery as apolloClient_useSuspenseQuery } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type Mock } from 'vitest'

import PublishAllAudioDialog from './page'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockEnqueueSnackbar = vi.fn()
const mockPublishVariantsOnly = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh
  })
}))

vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: vi.fn(),
    useMutation: vi.fn()
  }
})

describe('PublishAllAudioDialog (route)', () => {
  const useSuspenseQuery = vi.mocked(apolloClient_useSuspenseQuery as unknown as Mock)
  const useMutation = vi.mocked(apolloClient_useMutation as unknown as Mock)

  beforeEach(() => {
    vi.clearAllMocks()

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
    ;(useMutation as Mock).mockReturnValue([mockPublishVariantsOnly, {}])
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
