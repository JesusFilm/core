import { fireEvent, render, screen } from '@testing-library/react'
import { Select } from './Select'

describe('Select', () => {
  it('renders the select component with options', () => {
    const options = ['Option 1', 'Option 2', 'Option 3']
    const onChange = jest.fn()

    render(
      <Select label={'Select Option'} options={options} onChange={onChange} />
    )

    expect(screen.getAllByText('Select Option')[0]).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByRole('button'))
    const option1 = screen.getByRole('option', { name: 'Option 1' })
    fireEvent.click(option1)
    expect(onChange).toHaveBeenCalled()
  })
})
