import { useMutation } from '@apollo/client'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { SnackbarProvider } from 'notistack'
import { type Mock } from 'vitest'

import { resolvedParams } from '../../../../../../../test/utils/resolvedParams'

import DeleteEditionPage from './page'

// Mock the Apollo Client hooks
vi.mock('@apollo/client', () => ({
  useMutation: vi.fn(() => [vi.fn(), { loading: false }])
}))

// Mock the next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

// Mock Dialog component
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

describe('DeleteEditionPage', () => {
  it('displays a confirmation dialog', () => {
    render(
      <SnackbarProvider>
        <DeleteEditionPage
          params={resolvedParams({
            videoId: 'video-123',
            editionId: 'edition-123'
          })}
        />
      </SnackbarProvider>
    )

    expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    expect(screen.getByTestId('close-button')).toBeInTheDocument()

    expect(screen.getByTestId('dialog-title').textContent).toBe(
      'Delete Edition'
    )
    expect(screen.getByTestId('dialog-content').textContent).toBe(
      'Are you sure you want to delete the edition? This action cannot be undone.'
    )
    expect(screen.getByTestId('submit-button').textContent).toBe('Delete')
    expect(screen.getByTestId('close-button').textContent).toBe('Cancel')
  })

  it('calls the mutation and redirects when confirmed', async () => {
    const mockDeleteMutation = vi.fn().mockImplementation((options) => {
      // Call onCompleted callback immediately to simulate successful deletion
      if (options.onCompleted) {
        options.onCompleted()
      }
    })
    const mockRouter = { push: vi.fn() }

    vi.mocked(useMutation as unknown as Mock).mockReturnValue([
      mockDeleteMutation,
      { loading: false }
    ])

    vi.mocked(useRouter as unknown as Mock).mockReturnValue(mockRouter)

    render(
      <SnackbarProvider>
        <DeleteEditionPage
          params={resolvedParams({
            videoId: 'video-123',
            editionId: 'edition-123'
          })}
        />
      </SnackbarProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockDeleteMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { id: 'edition-123' }
        })
      )
      expect(mockRouter.push).toHaveBeenCalledWith(
        '/videos/video-123/editions',
        {
          scroll: false
        }
      )
    })
  })

  it('redirects when dialog is closed', async () => {
    const mockRouter = { push: vi.fn() }
    vi.mocked(useRouter as unknown as Mock).mockReturnValue(mockRouter)

    render(
      <SnackbarProvider>
        <DeleteEditionPage
          params={resolvedParams({
            videoId: 'video-123',
            editionId: 'edition-123'
          })}
        />
      </SnackbarProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-button'))

    expect(mockRouter.push).toHaveBeenCalledWith('/videos/video-123/editions', {
      scroll: false
    })
  })
})
