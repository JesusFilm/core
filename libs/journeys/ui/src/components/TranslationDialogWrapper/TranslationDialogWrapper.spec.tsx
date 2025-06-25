import Typography from '@mui/material/Typography'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

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
  const onCreateWithAi = jest.fn()

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
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
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
      expect(
        screen.queryByRole('button', { name: 'Create' })
      ).not.toBeInTheDocument()
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

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
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

      fireEvent.click(screen.getByRole('button', { name: 'Create' }))
      expect(onTranslate).toHaveBeenCalled()
    })
  })

  describe('Create with AI functionality', () => {
    describe('Button Rendering', () => {
      it('should show Create with AI button when onCreateWithAi is provided', () => {
        render(
          <FlagsProvider flags={{ aiCreateButton: true }}>
            <TranslationDialogWrapper
              open
              onClose={onClose}
              onTranslate={onTranslate}
              onCreateWithAi={onCreateWithAi}
              loading={false}
              title="Test Title"
              testId="test-dialog"
            >
              <Typography>Test Children</Typography>
            </TranslationDialogWrapper>
          </FlagsProvider>
        )

        expect(
          screen.getByRole('button', { name: 'Create with AI' })
        ).toBeInTheDocument()
      })

      it('should not render Create with AI button when onCreateWithAi is not provided', () => {
        render(
          <FlagsProvider flags={{ aiCreateButton: true }}>
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
          </FlagsProvider>
        )

        expect(
          screen.queryByRole('button', { name: 'Create with AI' })
        ).not.toBeInTheDocument()
      })

      it('should not render Create with AI button when onCreateWithAi is undefined', () => {
        render(
          <FlagsProvider flags={{ aiCreateButton: true }}>
            <TranslationDialogWrapper
              open
              onClose={onClose}
              onTranslate={onTranslate}
              onCreateWithAi={undefined}
              loading={false}
              title="Test Title"
              testId="test-dialog"
            >
              <Typography>Test Children</Typography>
            </TranslationDialogWrapper>
          </FlagsProvider>
        )

        expect(
          screen.queryByRole('button', { name: 'Create with AI' })
        ).not.toBeInTheDocument()
      })

      it('should not render Create with AI button when loading is true', () => {
        render(
          <FlagsProvider flags={{ aiCreateButton: true }}>
            <TranslationDialogWrapper
              open
              onClose={onClose}
              onTranslate={onTranslate}
              onCreateWithAi={onCreateWithAi}
              isTranslation={false}
              loading={true}
              title="Test Title"
              testId="test-dialog"
            >
              <Typography>Test Children</Typography>
            </TranslationDialogWrapper>
          </FlagsProvider>
        )

        expect(
          screen.queryByRole('button', { name: 'Create with AI' })
        ).not.toBeInTheDocument()
      })
    })

    describe('Button State', () => {
      it('should enable Create with AI button when isTranslation is false', () => {
        render(
          <FlagsProvider flags={{ aiCreateButton: true }}>
            <TranslationDialogWrapper
              open
              onClose={onClose}
              onTranslate={onTranslate}
              onCreateWithAi={onCreateWithAi}
              isTranslation={false}
              loading={false}
              title="Test Title"
              testId="test-dialog"
            >
              <Typography>Test Children</Typography>
            </TranslationDialogWrapper>
          </FlagsProvider>
        )

        const createWithAiButton = screen.getByRole('button', {
          name: 'Create with AI'
        })
        expect(createWithAiButton).toBeEnabled()
      })

      it('should disable Create with AI button when isTranslation is true', () => {
        render(
          <FlagsProvider flags={{ aiCreateButton: true }}>
            <TranslationDialogWrapper
              open
              onClose={onClose}
              onTranslate={onTranslate}
              onCreateWithAi={onCreateWithAi}
              isTranslation={true}
              loading={false}
              title="Test Title"
              testId="test-dialog"
            >
              <Typography>Test Children</Typography>
            </TranslationDialogWrapper>
          </FlagsProvider>
        )

        const createWithAiButton = screen.getByRole('button', {
          name: 'Create with AI'
        })
        expect(createWithAiButton).toBeDisabled()
      })
    })

    describe('Tooltip Behavior', () => {
      it('should show tooltip with correct message when button is disabled due to translation', async () => {
        const user = userEvent.setup()

        render(
          <FlagsProvider flags={{ aiCreateButton: true }}>
            <TranslationDialogWrapper
              open
              onClose={onClose}
              onTranslate={onTranslate}
              onCreateWithAi={onCreateWithAi}
              isTranslation={true}
              loading={false}
              title="Test Title"
              testId="test-dialog"
            >
              <Typography>Test Children</Typography>
            </TranslationDialogWrapper>
          </FlagsProvider>
        )

        const createWithAiButton = screen.getByRole('button', {
          name: 'Create with AI'
        })

        // Hover over the button to trigger tooltip
        await user.hover(createWithAiButton.parentElement!)

        await waitFor(() => {
          expect(
            screen.getByText(
              'AI creation is not available when translation is enabled'
            )
          ).toBeInTheDocument()
        })
      })

      it('should not show tooltip when button is enabled', async () => {
        const user = userEvent.setup()

        render(
          <FlagsProvider flags={{ aiCreateButton: true }}>
            <TranslationDialogWrapper
              open
              onClose={onClose}
              onTranslate={onTranslate}
              onCreateWithAi={onCreateWithAi}
              isTranslation={false}
              loading={false}
              title="Test Title"
              testId="test-dialog"
            >
              <Typography>Test Children</Typography>
            </TranslationDialogWrapper>
          </FlagsProvider>
        )

        const createWithAiButton = screen.getByRole('button', {
          name: 'Create with AI'
        })

        // Hover over the button
        await user.hover(createWithAiButton)

        // Wait a bit to ensure tooltip doesn't appear
        await new Promise((resolve) => setTimeout(resolve, 100))

        expect(
          screen.queryByText(
            'AI creation is not available when translation is enabled'
          )
        ).not.toBeInTheDocument()
      })
    })

    describe('Click Handling', () => {
      it('should call onCreateWithAi when Create with AI button is clicked and enabled', async () => {
        render(
          <FlagsProvider flags={{ aiCreateButton: true }}>
            <TranslationDialogWrapper
              open
              onClose={onClose}
              onTranslate={onTranslate}
              onCreateWithAi={onCreateWithAi}
              isTranslation={false}
              loading={false}
              title="Test Title"
              testId="test-dialog"
            >
              <Typography>Test Children</Typography>
            </TranslationDialogWrapper>
          </FlagsProvider>
        )

        const createWithAiButton = screen.getByRole('button', {
          name: 'Create with AI'
        })
        fireEvent.click(createWithAiButton)

        await waitFor(() => {
          expect(onCreateWithAi).toHaveBeenCalledTimes(1)
        })
      })

      it('should not call onCreateWithAi when button is disabled due to translation', () => {
        render(
          <FlagsProvider flags={{ aiCreateButton: true }}>
            <TranslationDialogWrapper
              open
              onClose={onClose}
              onTranslate={onTranslate}
              onCreateWithAi={onCreateWithAi}
              isTranslation={true}
              loading={false}
              title="Test Title"
              testId="test-dialog"
            >
              <Typography>Test Children</Typography>
            </TranslationDialogWrapper>
          </FlagsProvider>
        )

        const createWithAiButton = screen.getByRole('button', {
          name: 'Create with AI'
        })
        fireEvent.click(createWithAiButton)

        expect(onCreateWithAi).not.toHaveBeenCalled()
        expect(createWithAiButton).toBeDisabled()
      })
    })
  })
})
