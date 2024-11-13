import { render, screen } from '@testing-library/react'
import { useField } from 'formik'

import { FormSelect } from './FormSelect'

const props = {
  name: 'select',
  label: 'FormSelect',
  options: [{ label: 'Frodo', value: 'frodo' }]
}

const fieldMock = { value: 'frodo', name: 'name' }
const metaMock = { value: '', error: '', touched: false, initialTouched: false }

jest.mock('formik', () => ({
  __esModule: true,
  useField: jest.fn()
}))

const useFieldMock = useField as jest.Mock

describe('FormSelect', () => {
  it('should render with value', () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock])
    render(<FormSelect {...props} />)

    const select = screen.getByRole('combobox', { name: 'FormSelect' })
    expect(select).toBeInTheDocument()
    expect(select).toHaveTextContent('Frodo')
  })

  it('should show helper text', () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock])
    render(<FormSelect {...props} helperText="Members of the Fellowship" />)

    const select = screen.getByRole('combobox')
    expect(select).toHaveAccessibleDescription('Members of the Fellowship')
  })

  it('should show error', () => {
    useFieldMock.mockImplementation(() => [
      fieldMock,
      { ...metaMock, error: 'Required', touched: true }
    ])
    render(<FormSelect {...props} helperText="Members of the Fellowship" />)

    const select = screen.getByRole('combobox')
    expect(select).toHaveAccessibleDescription('Required')
  })
})
