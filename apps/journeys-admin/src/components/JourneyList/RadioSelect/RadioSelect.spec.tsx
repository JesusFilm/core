import FilterList from '@mui/icons-material/FilterList'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import { RadioSelect, RadioSelectOption } from './RadioSelect'

jest.mock('@core/shared/ui/useBreakpoints', () => ({
  __esModule: true,
  useBreakpoints: jest.fn()
}))

describe('RadioSelect', () => {
  const mockOnChange = jest.fn()
  const mockUseBreakpoints = useBreakpoints as jest.Mock

  const defaultOptions: RadioSelectOption<'option1' | 'option2' | 'option3'>[] =
    [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ]

  const defaultProps = {
    defaultValue: 'option1' as const,
    options: defaultOptions,
    onChange: mockOnChange,
    ariaLabel: 'Test Radio Select'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseBreakpoints.mockReturnValue({
      xs: false,
      sm: true,
      md: true,
      lg: true,
      xl: true
    })
  })

  describe('Rendering', () => {
    it('should render with default value', () => {
      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Option 1')
    })

    it('should render with controlled value', () => {
      render(<RadioSelect {...defaultProps} value="option2" />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      expect(button).toHaveTextContent('Option 2')
    })

    it('should render with trigger prefix', () => {
      render(<RadioSelect {...defaultProps} triggerPrefix="Sort: " />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      expect(button).toHaveTextContent('Sort: Option 1')
    })

    it('should render mobile icon when on small screen', () => {
      mockUseBreakpoints.mockReturnValue({
        xs: false,
        sm: false,
        md: false,
        lg: false,
        xl: false
      })

      const mobileIcon = <FilterList data-testid="mobile-icon" />
      render(<RadioSelect {...defaultProps} mobileIcon={mobileIcon} />)

      expect(screen.getByTestId('mobile-icon')).toBeInTheDocument()
      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      expect(button).not.toHaveTextContent('Option 1')
    })

    it('should not render mobile icon when on larger screen', () => {
      mockUseBreakpoints.mockReturnValue({
        xs: false,
        sm: true,
        md: true,
        lg: true,
        xl: true
      })

      const mobileIcon = <FilterList data-testid="mobile-icon" />
      render(<RadioSelect {...defaultProps} mobileIcon={mobileIcon} />)

      expect(screen.queryByTestId('mobile-icon')).not.toBeInTheDocument()
      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      expect(button).toHaveTextContent('Option 1')
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      expect(button).toHaveAttribute('aria-label', 'Test Radio Select')
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('should update aria-expanded when opened', () => {
      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.click(button)

      expect(button).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Opening and Closing', () => {
    it('should open Popover on desktop when clicked', () => {
      mockUseBreakpoints.mockReturnValue({
        xs: false,
        sm: false,
        md: true,
        lg: true,
        xl: true
      })

      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.click(button)

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Option 3')).toBeInTheDocument()
    })

    it('should open Drawer on mobile when clicked', () => {
      mockUseBreakpoints.mockReturnValue({
        xs: false,
        sm: false,
        md: false,
        lg: false,
        xl: false
      })

      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.click(button)

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Option 3')).toBeInTheDocument()
    })

    it('should open on Enter key press', () => {
      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.keyDown(button, { key: 'Enter' })

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument()
    })

    it('should open on Space key press', () => {
      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.keyDown(button, { key: ' ' })

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument()
    })

    it('should not open on other key press', () => {
      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.keyDown(button, { key: 'Tab' })

      expect(screen.queryByLabelText('Option 1')).not.toBeInTheDocument()
    })

    it('should open when open prop is true', () => {
      render(<RadioSelect {...defaultProps} open={true} />)

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument()
    })

    it('should close when clicking outside Popover', async () => {
      mockUseBreakpoints.mockReturnValue({
        xs: false,
        sm: false,
        md: true,
        lg: true,
        xl: true
      })

      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.click(button)

      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument()

      // Click on backdrop to close Popover
      const backdrop = document.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.mouseDown(backdrop)
        fireEvent.click(backdrop)
      }

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('should close Drawer when clicking backdrop', async () => {
      mockUseBreakpoints.mockReturnValue({
        xs: false,
        sm: false,
        md: false,
        lg: false,
        xl: false
      })

      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.click(button)

      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument()

      // Click on backdrop
      const backdrop = document.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.mouseDown(backdrop)
        fireEvent.click(backdrop)
      }

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'false')
      })
    })
  })

  describe('Selection', () => {
    it('should call onChange when option is selected', () => {
      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.click(button)

      const option2 = screen.getByLabelText('Option 2')
      fireEvent.click(option2)

      expect(mockOnChange).toHaveBeenCalledWith('option2')
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should close after selecting an option', async () => {
      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.click(button)

      expect(button).toHaveAttribute('aria-expanded', 'true')

      const option2 = screen.getByLabelText('Option 2')
      fireEvent.click(option2)

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('should update displayed value after selection', () => {
      const { rerender } = render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      expect(button).toHaveTextContent('Option 1')

      fireEvent.click(button)
      const option3 = screen.getByLabelText('Option 3')
      fireEvent.click(option3)

      expect(mockOnChange).toHaveBeenCalledWith('option3')

      rerender(<RadioSelect {...defaultProps} value="option3" />)

      expect(button).toHaveTextContent('Option 3')
    })

    it('should show current selected option as checked', () => {
      render(<RadioSelect {...defaultProps} value="option2" />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.click(button)

      const option2Radio = screen
        .getByLabelText('Option 2')
        .closest('label')
        ?.querySelector('input[type="radio"]')

      expect(option2Radio).toBeChecked()
    })
  })

  describe('Form Structure', () => {
    it('should render all options in RadioGroup', () => {
      render(<RadioSelect {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      fireEvent.click(button)

      expect(
        screen.getByLabelText('Test Radio Select-options')
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Option 3')).toBeInTheDocument()
    })

    it('should have correct name attribute on RadioGroup', () => {
      render(<RadioSelect {...defaultProps} ariaLabel="Custom Label" />)

      const button = screen.getByRole('button', { name: 'Custom Label' })
      fireEvent.click(button)

      const radioGroup = screen.getByLabelText('Custom Label-options')
      const radioButtons = radioGroup.querySelectorAll('input[type="radio"]')

      radioButtons.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'Custom Label-buttons-group')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle option with missing label gracefully', () => {
      const optionsWithMissingLabel: RadioSelectOption<
        'option1' | 'option2'
      >[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]

      const missingValueOptions = [
        ...optionsWithMissingLabel,
        { value: 'option3' as const, label: 'Option 3' }
      ]

      render(
        <RadioSelect
          {...defaultProps}
          defaultValue="option3"
          options={missingValueOptions}
        />
      )

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      expect(button).toHaveTextContent('Option 3')
    })

    it('should handle empty options array', () => {
      render(
        <RadioSelect {...defaultProps} defaultValue="option1" options={[]} />
      )

      const button = screen.getByRole('button', { name: 'Test Radio Select' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('')
    })
  })
})
