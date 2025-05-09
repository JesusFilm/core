import Typography from '@mui/material/Typography'
import { fireEvent, render, screen } from '@testing-library/react'

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
          loading={false}
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

    it('should render loading UI and hide normal content when loading', () => {
      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={onTranslate}
          loading={true}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      // Check that loading state is shown
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(
        screen.getByText('Translating your journey...')
      ).toBeInTheDocument()

      // Check that normal content is hidden
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
      expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
      expect(screen.queryByText('Create')).not.toBeInTheDocument()

      // Check that only Cancel button is shown
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should render custom loading text when provided', () => {
      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={onTranslate}
          loading={true}
          title="Test Title"
          loadingText="Custom Loading Text"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      // Check that custom loading text is shown
      expect(screen.getByText('Custom Loading Text')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClose when Cancel button is clicked in normal state', () => {
      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={onTranslate}
          loading={false}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      fireEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalled()
    })

    it('should call onClose when Cancel button is clicked in loading state', () => {
      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={onTranslate}
          loading={true}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      fireEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalled()
    })

    it('should call onTranslate when Create button is clicked', () => {
      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={onTranslate}
          loading={false}
          title="Test Title"
          testId="test-dialog"
        >
          <Typography data-testid="test-children">Test Children</Typography>
        </TranslationDialogWrapper>
      )

      // Click the Create button
      fireEvent.click(screen.getByText('Create'))
      expect(onTranslate).toHaveBeenCalled()
    })
  })
})
