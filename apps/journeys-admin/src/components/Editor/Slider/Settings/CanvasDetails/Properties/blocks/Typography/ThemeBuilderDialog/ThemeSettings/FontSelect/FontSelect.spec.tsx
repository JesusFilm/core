import { fireEvent, render, screen } from '@testing-library/react'

import Header1Icon from '@core/shared/ui/icons/Header1'

import { FontSelect } from './FontSelect'

describe('FontSelect', () => {
  const handleChange = jest.fn()

  it('should render font select with options', () => {
    render(
      <FontSelect
        label="Label"
        value="Option 1"
        options={['Option 1', 'Option 2']}
        onChange={handleChange}
        icon={<Header1Icon />}
        labelId="label-id"
        selectId="select-id"
      />
    )
    expect(screen.getByRole('combobox', { name: 'Label' })).toHaveTextContent(
      'Option 1'
    )

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Label' }))
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument()
  })

  it('should render none option when value is empty', () => {
    render(
      <FontSelect
        label="Label"
        value=""
        options={['Option 1', 'Option 2']}
        onChange={handleChange}
        icon={<Header1Icon />}
        labelId="label-id"
        selectId="select-id"
      />
    )
    expect(screen.getByRole('combobox', { name: 'Label' })).toHaveTextContent(
      'None'
    )
  })

  it('should call onChange when option is selected', () => {
    render(
      <FontSelect
        label="Label"
        value="Option 1"
        options={['Option 1', 'Option 2']}
        onChange={handleChange}
        icon={<Header1Icon />}
        labelId="label-id"
        selectId="select-id"
      />
    )
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Label' }))
    fireEvent.click(screen.getByRole('option', { name: 'Option 2' }))
    expect(handleChange).toHaveBeenCalledWith('Option 2')
  })
})
