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
          <Typography>Test Children</Typography>
        </TranslationDialogWrapper>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Children')).toBeInTheDocument()
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
          isTranslation={true}
        >
          <Typography>Test Children</Typography>
        </TranslationDialogWrapper>
      )

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(
        screen.getByText('Translating your journey...')
      ).toBeInTheDocument()

      expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
      expect(screen.queryByText('Test Children')).not.toBeInTheDocument()
      expect(screen.queryByText('Create')).not.toBeInTheDocument()
    })

    it('should render custom loading text when provided and loading is true', () => {
      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={onTranslate}
          loading={true}
          title="Test Title"
          loadingText="Custom Loading Text"
          testId="test-dialog"
          isTranslation={true}
        >
          <Typography>Test Children</Typography>
        </TranslationDialogWrapper>
      )

      expect(screen.getByText('Custom Loading Text')).toBeInTheDocument()
    })

    it('should not render loading UI if not being translated', () => {
      render(
        <TranslationDialogWrapper
          open
          onClose={onClose}
          onTranslate={onTranslate}
          loading={true}
          title="Test Title"
          testId="test-dialog"
          isTranslation={false}
        >
          <Typography>Test Children</Typography>
        </TranslationDialogWrapper>
      )

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
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
          <Typography>Test Children</Typography>
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
          <Typography>Test Children</Typography>
        </TranslationDialogWrapper>
      )

      fireEvent.click(screen.getByText('Create'))
      expect(onTranslate).toHaveBeenCalled()
    })
  })
})
