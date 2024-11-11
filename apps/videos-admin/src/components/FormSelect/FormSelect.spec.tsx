import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FormSelect } from './FormSelect'

describe('FormSelect', () => {
  const mockChange = jest.fn()

  it('should render', () => {
    render(
      <FormSelect
        name="select"
        label="Formselect"
        options={[{ label: 'Frodo', value: 'frodo' }]}
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(select).toHaveTextContent('Frodo')
    expect(screen.getByText('Formselect')).toBeInTheDocument()
  })

  it('should emit change callback on change', async () => {
    render(
      <FormSelect
        name="select"
        label="Formselect"
        options={[
          { label: 'Frodo', value: 'frodo' },
          { label: 'Sam', value: 'sam' }
        ]}
      />
    )

    const select = screen.getByRole('combobox')
    await userEvent.click(select)
    await userEvent.click(screen.getByText('Sam'))

    expect(select).toHaveTextContent('Sam')
    expect(mockChange).toHaveBeenCalled()
  })
})
