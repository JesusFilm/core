import { render, screen } from '@testing-library/react'
import { useField } from 'formik'

import { FormTextField } from './FormTextField'

const props = {
  name: 'name',
  label: 'FormTextField'
}

const fieldMock = { value: 'Textfield value', name: 'name' }
const metaMock = { value: '', error: '', touched: false, initialTouched: false }

jest.mock('formik', () => ({
  __esModule: true,
  useField: jest.fn()
}))

const useFieldMock = useField as jest.Mock

describe('FormTextField', () => {
  it('should render with value', () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock])
    render(<FormTextField {...props} />)

    const field = screen.getByRole('textbox', { name: 'FormTextField' })
    expect(field).toBeInTheDocument()
    expect(field).toHaveValue('Textfield value')
  })

  it('should show helper text', () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock])

    render(<FormTextField {...props} helperText="Helper text" />)

    const field = screen.getByRole('textbox', { name: 'FormTextField' })

    expect(field).toHaveAccessibleDescription('Helper text')
  })

  it('should show error', () => {
    useFieldMock.mockImplementation(() => [
      fieldMock,
      { ...metaMock, error: 'Required', touched: true }
    ])

    render(<FormTextField {...props} />)

    const field = screen.getByRole('textbox', { name: 'FormTextField' })

    expect(field).toHaveAccessibleDescription('Required')
  })
})
