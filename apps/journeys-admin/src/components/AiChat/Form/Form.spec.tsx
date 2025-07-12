import { UseChatHelpers } from '@ai-sdk/react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Form } from './Form'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('@core/shared/ui/icons/ArrowUp', () => {
  return function MockArrowUpIcon() {
    return <div data-testid="arrow-up-icon">ArrowUp</div>
  }
})

describe('Form', () => {
  const mockHandleSubmit = jest.fn()
  const mockHandleInputChange = jest.fn()
  const mockStop = jest.fn()

  const defaultProps = {
    input: '',
    onSubmit: mockHandleSubmit as UseChatHelpers['handleSubmit'],
    onInputChange: mockHandleInputChange as UseChatHelpers['handleInputChange'],
    error: undefined,
    status: 'ready' as UseChatHelpers['status'],
    stop: mockStop,
    waitForToolResult: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering & Structure', () => {
    it('should render form with all elements and proper structure', () => {
      render(<Form {...defaultProps} />)

      const form = screen.getByRole('textbox')
      expect(form).toBeInTheDocument()

      const textField = screen.getByRole('textbox')
      expect(textField).toBeInTheDocument()
      expect(textField).toHaveAttribute('placeholder', 'Ask Anything')
      expect(textField.tagName.toLowerCase()).toBe('textarea')
      expect(textField).toHaveFocus()

      const submitButton = screen.getByRole('button')
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
      expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument()
    })

    it('should display input value', () => {
      const inputValue = 'Test message'
      render(<Form {...defaultProps} input={inputValue} />)

      const textField = screen.getByRole('textbox')
      expect(textField).toHaveValue(inputValue)
      expect(textField).toHaveAttribute('name', 'userMessage')
    })
  })

  describe('Form Submission Flow', () => {
    it('should handle form submission via submit button with valid input', async () => {
      render(<Form {...defaultProps} input="Test message" />)

      const submitButton = screen.getByRole('button')
      expect(submitButton).not.toBeDisabled()
      await userEvent.click(submitButton)

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should handle form submission via Enter key with valid input', async () => {
      render(<Form {...defaultProps} input="Test message" />)

      const textField = screen.getByRole('textbox')
      fireEvent.keyDown(textField, { key: 'Enter', code: 'Enter' })

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should allow line breaks with Shift+Enter without submitting', async () => {
      // Use a local state to simulate controlled input behavior
      let currentValue = ''
      const mockInputChange = jest.fn().mockImplementation((e) => {
        currentValue = e.target.value
      })

      render(
        <Form
          {...defaultProps}
          input={currentValue}
          onInputChange={mockInputChange}
        />
      )

      const textField = screen.getByRole('textbox')

      await userEvent.type(textField, 'Line 1')

      fireEvent.keyDown(textField, {
        key: 'Enter',
        code: 'Enter',
        shiftKey: true
      })

      expect(mockHandleSubmit).not.toHaveBeenCalled()
      expect(mockInputChange).toHaveBeenCalled()
    })

    it('should handle input changes properly', async () => {
      render(<Form {...defaultProps} />)

      const textField = screen.getByRole('textbox')
      await userEvent.type(textField, 'T')

      expect(mockHandleInputChange).toHaveBeenCalled()
    })
  })

  describe('Button States & Interaction', () => {
    it('should show stop button when submitted or streaming and handle stop action', async () => {
      const { rerender } = render(<Form {...defaultProps} status="submitted" />)

      let stopButton = screen.getByRole('button')
      expect(stopButton).not.toHaveAttribute('type', 'submit')
      expect(screen.queryByTestId('arrow-up-icon')).not.toBeInTheDocument()

      expect(stopButton).toBeInTheDocument()

      await userEvent.click(stopButton)
      expect(mockStop).toHaveBeenCalledTimes(1)

      rerender(<Form {...defaultProps} status="streaming" />)

      stopButton = screen.getByRole('button')
      expect(stopButton).not.toHaveAttribute('type', 'submit')
      expect(screen.queryByTestId('arrow-up-icon')).not.toBeInTheDocument()
    })

    it('should show submit button with ArrowUp icon when not submitted or streaming', () => {
      const { rerender } = render(<Form {...defaultProps} status="ready" />)

      let submitButton = screen.getByRole('button')
      expect(submitButton).toHaveAttribute('type', 'submit')
      expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument()

      rerender(<Form {...defaultProps} status="error" />)

      submitButton = screen.getByRole('button')
      expect(submitButton).toHaveAttribute('type', 'submit')
      expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument()
    })
  })

  describe('Disabled States', () => {
    it('should disable TextField and buttons when error is present', () => {
      const error = new Error('Test error')
      const { rerender } = render(
        <Form {...defaultProps} error={error} status="ready" />
      )

      let textField = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button')

      expect(textField).toBeDisabled()
      expect(submitButton).toBeDisabled()

      rerender(<Form {...defaultProps} error={error} status="submitted" />)

      textField = screen.getByRole('textbox')
      const stopButton = screen.getByRole('button')

      expect(textField).toBeDisabled()
      expect(stopButton).toBeDisabled()
    })

    it('should disable TextField and buttons when waiting for tool result', () => {
      const { rerender } = render(
        <Form {...defaultProps} waitForToolResult={true} status="ready" />
      )

      let textField = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button')

      expect(textField).toBeDisabled()
      expect(submitButton).toBeDisabled()

      // Test stop button disabled
      rerender(
        <Form {...defaultProps} waitForToolResult={true} status="streaming" />
      )

      textField = screen.getByRole('textbox')
      const stopButton = screen.getByRole('button')

      expect(textField).toBeDisabled()
      expect(stopButton).toBeDisabled()
    })

    it('should not respond to keyboard interactions when disabled', async () => {
      const error = new Error('Test error')
      render(<Form {...defaultProps} error={error} />)

      const textField = screen.getByRole('textbox')

      expect(textField).toBeDisabled()

      // Should not respond to typing when disabled
      await userEvent.type(textField, 'test')
      expect(mockHandleInputChange).not.toHaveBeenCalled()
    })
  })

  describe('Empty Input Validation', () => {
    it('should handle empty input correctly', async () => {
      const { rerender } = render(<Form {...defaultProps} input="" />)

      const textField = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button')

      expect(submitButton).not.toBeDisabled()

      textField.focus()
      fireEvent.keyDown(textField, { key: 'Enter', code: 'Enter' })
      expect(mockHandleSubmit).not.toHaveBeenCalled()

      rerender(<Form {...defaultProps} input="Hello AI" />)
      const enabledSubmitButton = screen.getByRole('button')
      expect(enabledSubmitButton).not.toBeDisabled()
    })

    it('should handle whitespace-only input correctly', async () => {
      render(<Form {...defaultProps} input="   " />)

      const textField = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button')

      expect(submitButton).toBeDisabled()

      textField.focus()
      fireEvent.keyDown(textField, { key: 'Enter', code: 'Enter' })
      expect(mockHandleSubmit).not.toHaveBeenCalled()
    })
  })
})
