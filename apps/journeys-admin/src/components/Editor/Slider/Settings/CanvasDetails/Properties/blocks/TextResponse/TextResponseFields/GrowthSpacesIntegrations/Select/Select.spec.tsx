import { fireEvent, render, screen } from '@testing-library/react'

import { Select } from './Select'

describe('Select', () => {
  it('renders the select component with options', () => {
    const options = [{ value: '1', label: 'Option 1' }]
    const onChange = jest.fn()

    render(
      <Select label="Select Option" options={options} onChange={onChange} />
    )

    expect(screen.getAllByText('Select Option')[0]).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByRole('combobox'))
    const option = screen.getByRole('option', { name: 'Option 1' })
    fireEvent.click(option)
    expect(onChange).toHaveBeenCalledWith('1')
  })

  it('handles none selection', () => {
    const options = [{ value: '1', label: 'Option 1' }]
    const onChange = jest.fn()

    render(
      <Select
        label="Select Option"
        value="1"
        options={options}
        onChange={onChange}
      />
    )

    expect(screen.getAllByText('Select Option')[0]).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByRole('combobox'))
    const option = screen.getByRole('option', { name: 'None' })
    fireEvent.click(option)
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
