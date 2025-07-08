import { fireEvent, render, screen } from '@testing-library/react'

// Import the component under test
import DeleteVideoPage from './page'

// Mock Apollo client
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
    useSuspenseQuery: jest.fn(() => ({
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
jest.mock('@core/shared/ui/Dialog', () => ({
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
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Mock notistack
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  })
}))

describe('DeleteVideoPage', () => {
  const mockVideoId = 'video-123'

  // Mock functions
  const mockDeleteMutation = jest.fn()
  const mockRouterPush = jest.fn()
  const mockEnqueueSnackbar = jest.fn()

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock router.push
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockImplementation(() => ({
        push: mockRouterPush
      }))

    // Mock useMutation
    jest
      .spyOn(require('@apollo/client'), 'useMutation')
      .mockReturnValue([mockDeleteMutation, { loading: false }])

    // Mock useSnackbar
    jest.spyOn(require('notistack'), 'useSnackbar').mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar
    })
  })

  describe('for draft video that can be deleted', () => {
    beforeEach(() => {
      // Mock successful query for draft video
      jest
        .spyOn(require('@apollo/client'), 'useSuspenseQuery')
        .mockReturnValue({
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
      render(<DeleteVideoPage params={{ videoId: mockVideoId }} />)

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
      render(<DeleteVideoPage params={{ videoId: mockVideoId }} />)

      // Click cancel button
      fireEvent.click(screen.getByTestId('close-button'))

      // Check if router.push was called with the correct path
      expect(mockRouterPush).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
        scroll: false
      })
    })

    it('calls delete mutation when delete button is clicked', () => {
      render(<DeleteVideoPage params={{ videoId: mockVideoId }} />)

      // Click delete button
      fireEvent.click(screen.getByTestId('submit-button'))

      // Check if the mutation was called
      expect(mockDeleteMutation).toHaveBeenCalled()
    })

    it('shows loading state when mutation is in progress', () => {
      // Mock loading state
      jest
        .spyOn(require('@apollo/client'), 'useMutation')
        .mockReturnValue([mockDeleteMutation, { loading: true }])

      render(<DeleteVideoPage params={{ videoId: mockVideoId }} />)

      // Check that the delete button is disabled
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })
  })

  describe('for published video that cannot be deleted', () => {
    beforeEach(() => {
      // Mock query for published video
      jest
        .spyOn(require('@apollo/client'), 'useSuspenseQuery')
        .mockReturnValue({
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
      render(<DeleteVideoPage params={{ videoId: mockVideoId }} />)

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
      jest
        .spyOn(require('@apollo/client'), 'useSuspenseQuery')
        .mockReturnValue({
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
      render(<DeleteVideoPage params={{ videoId: mockVideoId }} />)

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
      jest
        .spyOn(require('@apollo/client'), 'useSuspenseQuery')
        .mockReturnValue({
          data: {
            adminVideo: null
          }
        })
    })

    it('shows error message and redirects when video not found', () => {
      render(<DeleteVideoPage params={{ videoId: mockVideoId }} />)

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
