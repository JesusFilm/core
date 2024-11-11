import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FormTextField } from './FormTextField'

describe('FormTextField', () => {
  it('should render with value', () => {
    render(
      <FormTextField
        name="textfield"
        label="Textfield"
        defaultValue="Textfield value"
      />
    )

    const field = screen.getByRole('textbox', { name: 'Textfield' })
    expect(field).toBeInTheDocument()
    expect(field).toHaveValue('Textfield value')
  })

  it('should display as readonly', () => {
    render(<FormTextField name="textfield" label="Textfield" disabled />)

    const field = screen.getByRole('textbox', { name: 'Textfield' })
    expect(field).toHaveValue('Readonly value')
    expect(field).toBeDisabled()
  })

  it('should call update callback with value', async () => {
    const mockUpdate = jest.fn()

    render(<FormTextField name="textfield" label="Textfield" />)

    const field = screen.getByRole('textbox', { name: 'Textfield' })
    expect(field).toBeInTheDocument()
    expect(field).toHaveValue('Textfield value')

    await userEvent.clear(field)
    await userEvent.type(field, 'Foo bar')

    expect(field).toHaveValue('Foo bar')

    await userEvent.tab()

    expect(mockUpdate).toHaveBeenCalledWith('Foo bar')
  })
})
