import { useMutation } from '@apollo/client'
import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { type Mock } from 'vitest'

import { resolvedParams } from '../../../../../../../test/utils/resolvedParams'

// Import the component under test
import DeleteAudio from './page'

// Mock Apollo client
vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useMutation: vi.fn(() => [vi.fn(), { loading: false }]),
    useSuspenseQuery: vi.fn(() => ({
      data: {
        videoVariant: {
          id: 'variant-456',
          language: {
            name: [{ value: 'English' }]
          }
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
  }))}))

// Mock notistack
vi.mock('notistack', () => ({
  enqueueSnackbar: vi.fn()
}))

describe('DeleteAudio', () => {
  const mockVideoId = 'video-123'
  const mockVariantId = 'variant-456'
  const mockReturnUrl = `/videos/${mockVideoId}/audio`

  // Mock functions
  const mockDeleteMutation = vi.fn()
  const mockRouterPush = vi.fn()
  const mockEnqueueSnackbar = vi.fn()

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock router.push
    vi.mocked(useRouter as unknown as Mock)
      .mockImplementation(() => ({
        push: mockRouterPush
      }))

    // Mock useMutation
    vi.mocked(useMutation as unknown as Mock)
      .mockReturnValue([mockDeleteMutation, { loading: false }])

    // Mock enqueueSnackbar
    vi.mocked(enqueueSnackbar as unknown as Mock)
      .mockImplementation(mockEnqueueSnackbar)
  })

  it('renders the delete audio dialog with confirmation message', () => {
    render(
      <DeleteAudio
        params={resolvedParams({
          videoId: mockVideoId,
          variantId: mockVariantId
        })}
      />
    )

    // Check dialog title
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Delete Audio Language'
    )

    // Check confirmation message
    expect(screen.getByTestId('dialog-content')).toHaveTextContent(
      'Are you sure you want to delete the English audio language? This action cannot be undone.'
    )

    // Check buttons
    expect(screen.getByTestId('close-button')).toHaveTextContent('Cancel')
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Delete')
  })

  it('navigates back when cancel button is clicked', () => {
    render(
      <DeleteAudio
        params={resolvedParams({
          videoId: mockVideoId,
          variantId: mockVariantId
        })}
      />
    )

    // Click cancel button
    fireEvent.click(screen.getByTestId('close-button'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(mockReturnUrl, {
      scroll: false
    })
  })

  it('calls delete mutation when delete button is clicked', () => {
    render(
      <DeleteAudio
        params={resolvedParams({
          videoId: mockVideoId,
          variantId: mockVariantId
        })}
      />
    )

    // Click delete button
    fireEvent.click(screen.getByTestId('submit-button'))

    // Check if the mutation was called
    expect(mockDeleteMutation).toHaveBeenCalled()
  })

  it('shows loading state when mutation is in progress', () => {
    // Mock loading state
    vi.mocked(useMutation as unknown as Mock)
      .mockReturnValue([mockDeleteMutation, { loading: true }])

    render(
      <DeleteAudio
        params={resolvedParams({
          videoId: mockVideoId,
          variantId: mockVariantId
        })}
      />
    )

    // Check that the delete button is disabled
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })
})
