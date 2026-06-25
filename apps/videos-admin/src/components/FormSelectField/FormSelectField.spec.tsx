import { render, screen } from '@testing-library/react'
import { useField } from 'formik'
import { type Mock } from 'vitest'

import { FormSelectField } from './FormSelectField'

const props = {
  name: 'select',
  label: 'FormSelectField',
  options: [{ label: 'Frodo', value: 'frodo' }]
}

const fieldMock = { value: 'frodo', name: 'name' }
const metaMock = { value: '', error: '', touched: false, initialTouched: false }

vi.mock('formik', () => ({
  __esModule: true,
  useField: vi.fn()
}))

const useFieldMock = useField as Mock

describe('FormSelectField', () => {
  it('should render with value', () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock])
    render(<FormSelectField {...props} />)

    const select = screen.getByRole('combobox', { name: 'FormSelectField' })
    expect(select).toBeInTheDocument()
    expect(select).toHaveTextContent('Frodo')
  })

  it('should show helper text', () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock])
    render(
      <FormSelectField {...props} helperText="Members of the Fellowship" />
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveAccessibleDescription('Members of the Fellowship')
  })

  it('should show error', () => {
    useFieldMock.mockImplementation(() => [
      fieldMock,
      { ...metaMock, error: 'Required', touched: true }
    ])
    render(
      <FormSelectField {...props} helperText="Members of the Fellowship" />
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveAccessibleDescription('Required')
  })
})
