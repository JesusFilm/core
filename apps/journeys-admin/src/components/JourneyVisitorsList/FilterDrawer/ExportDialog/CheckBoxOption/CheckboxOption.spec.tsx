import { fireEvent, render } from '@testing-library/react'
import noop from 'lodash/noop'

import { CheckboxOption } from './CheckboxOption'

describe('CheckboxOption', () => {
  it('should render with label', () => {
    const { getByLabelText } = render(
      <CheckboxOption checked={false} onChange={noop} label="Test Label" />
    )
    expect(getByLabelText('Test Label')).toBeInTheDocument()
  })

  it('should render checked state correctly', () => {
    const { getByRole } = render(
      <CheckboxOption checked={true} onChange={noop} label="Test Label" />
    )
    expect(getByRole('checkbox')).toBeChecked()
  })

  it('should render unchecked state correctly', () => {
    const { getByRole } = render(
      <CheckboxOption checked={false} onChange={noop} label="Test Label" />
    )
    expect(getByRole('checkbox')).not.toBeChecked()
  })

  it('should call onChange when clicked', () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <CheckboxOption
        checked={false}
        onChange={handleChange}
        label="Test Label"
      />
    )

    fireEvent.click(getByRole('checkbox'))
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('should call onClick when provided', () => {
    const handleClick = jest.fn()
    const { getByLabelText } = render(
      <CheckboxOption
        checked={false}
        onChange={noop}
        label="Test Label"
        onClick={handleClick}
      />
    )

    fireEvent.click(getByLabelText('Test Label'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should render in indeterminate state', () => {
    const { getByRole } = render(
      <CheckboxOption
        checked={false}
        onChange={noop}
        label="Test Label"
        indeterminate={true}
      />
    )
    const checkbox = getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-indeterminate', 'true')
  })
})
