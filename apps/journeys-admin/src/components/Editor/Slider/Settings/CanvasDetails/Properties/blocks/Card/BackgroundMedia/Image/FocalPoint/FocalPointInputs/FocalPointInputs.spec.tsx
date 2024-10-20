import { fireEvent, render } from '@testing-library/react'

import { FocalPointInputs } from './FocalPointInputs'

describe('FocalPointInputs', () => {
  const mockProps = {
    localPosition: { x: 50, y: 50 },
    handleChange: jest.fn()
  }

  it('renders correctly', () => {
    const { getByLabelText } = render(<FocalPointInputs {...mockProps} />)

    expect(getByLabelText('Left')).toHaveValue(50)
    expect(getByLabelText('Top')).toHaveValue(50)
  })

  it('calls handleChange with correct values when x input changes', () => {
    const { getByLabelText } = render(<FocalPointInputs {...mockProps} />)

    fireEvent.change(getByLabelText('Left'), { target: { value: '75' } })
    expect(mockProps.handleChange).toHaveBeenCalledWith('x', '75')
  })

  it('calls handleChange with correct values when y input changes', () => {
    const { getByLabelText } = render(<FocalPointInputs {...mockProps} />)

    fireEvent.change(getByLabelText('Top'), { target: { value: '25' } })
    expect(mockProps.handleChange).toHaveBeenCalledWith('y', '25')
  })

  it('displays the current localPosition values', () => {
    const customProps = {
      ...mockProps,
      localPosition: { x: 75, y: 25 }
    }
    const { getByLabelText } = render(<FocalPointInputs {...customProps} />)

    expect(getByLabelText('Left')).toHaveValue(75)
    expect(getByLabelText('Top')).toHaveValue(25)
  })
})
