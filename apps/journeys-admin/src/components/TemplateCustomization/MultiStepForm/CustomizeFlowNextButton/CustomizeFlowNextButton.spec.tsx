import { fireEvent, render, screen } from '@testing-library/react'

import { CustomizeFlowNextButton } from './CustomizeFlowNextButton'

describe('CustomizeFlowNextButton', () => {
  const defaultProps = {
    label: 'Next Step',
    testId: 'customize-flow-next-button'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render the button with default props', () => {
      render(<CustomizeFlowNextButton {...defaultProps} />)

      const button = screen.getByTestId('customize-flow-next-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'button')
      expect(button).not.toBeDisabled()
      expect(screen.getByText('Next Step')).toBeInTheDocument()
    })

    it('should render without label when not provided', () => {
      render(<CustomizeFlowNextButton testId="test-button" />)

      const button = screen.getByTestId('test-button')
      expect(button).toBeInTheDocument()
      expect(screen.queryByText('Next Step')).not.toBeInTheDocument()
    })

    it('should render button end adornment', () => {
      render(<CustomizeFlowNextButton {...defaultProps} />)

      const button = screen.getByTestId('customize-flow-next-button')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('should render as disabled when disabled prop is true', () => {
      render(<CustomizeFlowNextButton {...defaultProps} disabled />)

      const button = screen.getByTestId('customize-flow-next-button')
      expect(button).toBeDisabled()
    })

    it('should render with submit type when type is submit', () => {
      render(<CustomizeFlowNextButton {...defaultProps} type="submit" />)

      const button = screen.getByTestId('customize-flow-next-button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should render with form attribute when form prop is provided', () => {
      render(<CustomizeFlowNextButton {...defaultProps} form="test-form" />)

      const button = screen.getByTestId('customize-flow-next-button')
      expect(button).toHaveAttribute('form', 'test-form')
    })

    it('should handle empty string label', () => {
      render(<CustomizeFlowNextButton label="" testId="test-button" />)

      const button = screen.getByTestId('test-button')
      expect(button).toBeInTheDocument()

      const typography = button.querySelector('.MuiTypography-root')
      expect(typography).toBeInTheDocument()
      expect(typography).toHaveTextContent('')
    })

    it('should call onClick handler when clicked', () => {
      const handleClick = jest.fn()
      render(
        <CustomizeFlowNextButton {...defaultProps} onClick={handleClick} />
      )

      const button = screen.getByTestId('customize-flow-next-button')
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(
        <CustomizeFlowNextButton
          {...defaultProps}
          onClick={handleClick}
          disabled
        />
      )

      const button = screen.getByTestId('customize-flow-next-button')
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', () => {
      const handleClick = jest.fn()
      render(
        <CustomizeFlowNextButton
          {...defaultProps}
          onClick={handleClick}
          loading
        />
      )

      const button = screen.getByTestId('customize-flow-next-button')
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })
})
