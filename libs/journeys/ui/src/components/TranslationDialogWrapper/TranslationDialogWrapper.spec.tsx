import Typography from '@mui/material/Typography'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'

import { TranslationDialogWrapper } from './TranslationDialogWrapper'

jest.mock('next-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('TranslationDialogWrapper', () => {
  const onClose = jest.fn()
  const onTranslate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the title and children when not loading', () => {
      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={onTranslate}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()
    })

    it('should render loading UI and hide normal content when loading', async () => {
      const slowTranslate = jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve()
            }, 100)
          })
      )

      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={slowTranslate}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      // Click the Create button to trigger loading state
      fireEvent.click(screen.getByText('Create'))

      // Check that loading state is shown
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
        expect(
          screen.getByText('Translating your journey...')
        ).toBeInTheDocument()
      })

      // Check that normal content is hidden
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
      expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
      expect(screen.queryByText('Create')).not.toBeInTheDocument()

      // Check that only Cancel button is shown
      expect(screen.getByText('Cancel')).toBeInTheDocument()

      // Wait for the translation to complete
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      })
    })

    it('should render custom loading text when provided', async () => {
      const slowTranslate = jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve()
            }, 100)
          })
      )

      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={slowTranslate}
          title="Test Title"
          loadingText="Custom Loading Text"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      // Click the Create button to trigger loading state
      fireEvent.click(screen.getByText('Create'))

      // Check that custom loading text is shown
      await waitFor(() => {
        expect(screen.getByText('Custom Loading Text')).toBeInTheDocument()
      })

      // Wait for the translation to complete
      await waitFor(() => {
        expect(
          screen.queryByText('Custom Loading Text')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('interactions', () => {
    it('should call onClose when Cancel button is clicked in normal and loading states', async () => {
      const slowTranslate = jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve()
            }, 100)
          })
      )

      const { rerender } = render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={slowTranslate}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      // Test normal state cancel
      fireEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalledTimes(1)

      // Reset and rerender
      jest.clearAllMocks()
      rerender(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={slowTranslate}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      // Click Create to enter loading state
      fireEvent.click(screen.getByText('Create'))

      // Check that we're in loading state
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
      })

      // Test loading state cancel
      fireEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalledTimes(1)

      // Wait for the translation to complete
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      })
    })

    it('should call onTranslate when Create button is clicked', async () => {
      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={onTranslate}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      // Click the Create button
      await act(async () => {
        fireEvent.click(screen.getByText('Create'))
      })

      // Check that onTranslate was called
      expect(onTranslate).toHaveBeenCalledTimes(1)
    })

    it('should manage loading state during onTranslate lifecycle', async () => {
      const slowTranslate = jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve()
            }, 100)
          })
      )

      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={slowTranslate}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      // Verify initial non-loading state
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()

      // Click the Create button
      fireEvent.click(screen.getByText('Create'))

      // Verify loading state is activated
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
      })
      expect(slowTranslate).toHaveBeenCalledTimes(1)

      // Verify loading state is reset after resolution
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      })
      expect(screen.getByText('Create')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should reset loading state and log error if onTranslate throws an error', async () => {
      // Mock console.error to check if it's called
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          /* do nothing */
        })

      // Create a mock function that throws an error
      const failingTranslate = jest.fn().mockImplementation(
        () =>
          new Promise<void>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Test error'))
            }, 100)
          })
      )

      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={failingTranslate}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      // Click the Create button
      fireEvent.click(screen.getByText('Create'))

      // Verify loading state is activated
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
      })

      // Verify error was logged and loading state is reset
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      })

      // Verify UI returns to normal state
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()

      // Clean up spy
      consoleErrorSpy.mockRestore()
    })
  })
})
