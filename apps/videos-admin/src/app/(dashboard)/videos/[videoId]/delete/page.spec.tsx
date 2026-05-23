import { useMutation, useSuspenseQuery } from '@apollo/client'
import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { type Mock } from 'vitest'

// Import the component under test
import DeleteVideoPage from './page'

// Mock Apollo client
vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useMutation: vi.fn(() => [vi.fn(), { loading: false }]),
    useSuspenseQuery: vi.fn(() => ({
      data: {
        adminVideo: {
          id: 'video-123',
          published: false,
          publishedAt: null,
          title: [{ value: 'Test Draft Video' }]
        }
      }
    }))
  }
})

// Mock the Dialog component
vi.mock('@core/shared/ui/Dialog', () => ({
  Dialog: ({ children, onClose, dialogTitle, dialogAction, loading }) => (
    <div data-testid="mock-dialog">
      <div data-testid="dialog-title">{dialogTitle.title}</div>
      <button data-testid="close-button" onClick={onClose}>
        {dialogAction.closeLabel}
      </button>
      <div data-testid="dialog-content">{children}</div>
      <button
        data-testid="submit-button"
        onClick={dialogAction.onSubmit}
        disabled={loading}
      >
        {dialogAction.submitLabel}
      </button>
    </div>
  )
}))

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  })),
  useParams: () => ({ videoId: 'video-123' })
}))

// Mock notistack
vi.mock('notistack', () => ({
  useSnackbar: vi.fn(() => ({
    enqueueSnackbar: vi.fn()
  }))
}))

describe('DeleteVideoPage', () => {
  const mockVideoId = 'video-123'

  // Mock functions
  const mockDeleteMutation = vi.fn()
  const mockRouterPush = vi.fn()
  const mockEnqueueSnackbar = vi.fn()

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock router.push
    vi.mocked(useRouter as unknown as Mock).mockImplementation(() => ({
      push: mockRouterPush
    }))

    // Mock useMutation
    vi.mocked(useMutation as unknown as Mock).mockReturnValue([
      mockDeleteMutation,
      { loading: false }
    ])

    // Mock useSnackbar
    vi.mocked(useSnackbar as unknown as Mock).mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar
    })
  })

  describe('for draft video that can be deleted', () => {
    beforeEach(() => {
      // Mock successful query for draft video
      vi.mocked(useSuspenseQuery as unknown as Mock).mockReturnValue({
        data: {
          adminVideo: {
            id: mockVideoId,
            published: false,
            publishedAt: null,
            title: [{ value: 'Test Draft Video' }]
          }
        }
      })
    })

    it('renders the delete video dialog with confirmation message', () => {
      render(<DeleteVideoPage />)

      // Check dialog title
      expect(screen.getByTestId('dialog-title')).toHaveTextContent(
        'Delete Video'
      )

      // Check confirmation message
      expect(screen.getByTestId('dialog-content')).toHaveTextContent(
        'Are you sure you want to delete "Test Draft Video"? This action cannot be undone and will permanently remove the video and all its associated data.'
      )

      // Check buttons
      expect(screen.getByTestId('close-button')).toHaveTextContent('Cancel')
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Delete')
    })

    it('navigates back when cancel button is clicked', () => {
      render(<DeleteVideoPage />)

      // Click cancel button
      fireEvent.click(screen.getByTestId('close-button'))

      // Check if router.push was called with the correct path
      expect(mockRouterPush).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
        scroll: false
      })
    })

    it('calls delete mutation when delete button is clicked', () => {
      render(<DeleteVideoPage />)

      // Click delete button
      fireEvent.click(screen.getByTestId('submit-button'))

      // Check if the mutation was called
      expect(mockDeleteMutation).toHaveBeenCalled()
    })

    it('shows loading state when mutation is in progress', () => {
      // Mock loading state
      vi.mocked(useMutation as unknown as Mock).mockReturnValue([
        mockDeleteMutation,
        { loading: true }
      ])

      render(<DeleteVideoPage />)

      // Check that the delete button is disabled
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })
  })

  describe('for published video that cannot be deleted', () => {
    beforeEach(() => {
      // Mock query for published video
      vi.mocked(useSuspenseQuery as unknown as Mock).mockReturnValue({
        data: {
          adminVideo: {
            id: mockVideoId,
            published: true,
            publishedAt: new Date('2023-01-01'),
            title: [{ value: 'Published Video' }]
          }
        }
      })
    })

    it('shows error message and redirects for published video', () => {
      render(<DeleteVideoPage />)

      // Should show error message
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Cannot delete a video that has been published',
        { variant: 'error' }
      )

      // Should redirect back to video page
      expect(mockRouterPush).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
        scroll: false
      })
    })
  })

  describe('for video that was previously published', () => {
    beforeEach(() => {
      // Mock query for previously published video
      vi.mocked(useSuspenseQuery as unknown as Mock).mockReturnValue({
        data: {
          adminVideo: {
            id: mockVideoId,
            published: false,
            publishedAt: new Date('2023-01-01'), // Has publishedAt date
            title: [{ value: 'Previously Published Video' }]
          }
        }
      })
    })

    it('shows error message and redirects for previously published video', () => {
      render(<DeleteVideoPage />)

      // Should show error message
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Cannot delete a video that has been published',
        { variant: 'error' }
      )

      // Should redirect back to video page
      expect(mockRouterPush).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
        scroll: false
      })
    })
  })

  describe('when video is not found', () => {
    beforeEach(() => {
      // Mock query with no video found
      vi.mocked(useSuspenseQuery as unknown as Mock).mockReturnValue({
        data: {
          adminVideo: null
        }
      })
    })

    it('shows error message and redirects when video not found', () => {
      render(<DeleteVideoPage />)

      // Should show error message
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Video not found', {
        variant: 'error'
      })

      // Should redirect to videos list
      expect(mockRouterPush).toHaveBeenCalledWith('/videos', {
        scroll: false
      })
    })
  })
})
