import { fireEvent, render, screen } from '@testing-library/react'

import { FocalPointInputs } from './FocalPointInputs'

describe('FocalPointInputs', () => {
  const mockProps = {
    localPosition: { x: 50, y: 50 },
    handleChange: jest.fn()
  }

  it('renders correctly', () => {
    render(<FocalPointInputs {...mockProps} />)

    expect(screen.getByLabelText('Left')).toHaveValue(50)
    expect(screen.getByLabelText('Top')).toHaveValue(50)
  })

  it('calls handleChange with correct values when x input changes', () => {
    render(<FocalPointInputs {...mockProps} />)

    fireEvent.change(screen.getByLabelText('Left'), { target: { value: '75' } })
    expect(mockProps.handleChange).toHaveBeenCalledWith('x', '75')
  })

  it('calls handleChange with correct values when y input changes', () => {
    render(<FocalPointInputs {...mockProps} />)

    fireEvent.change(screen.getByLabelText('Top'), { target: { value: '25' } })
    expect(mockProps.handleChange).toHaveBeenCalledWith('y', '25')
  })

  it('displays the current localPosition values', () => {
    const customProps = {
      ...mockProps,
      localPosition: { x: 75, y: 25 }
    }
    render(<FocalPointInputs {...customProps} />)

    expect(screen.getByLabelText('Left')).toHaveValue(75)
    expect(screen.getByLabelText('Top')).toHaveValue(25)
  })
})
