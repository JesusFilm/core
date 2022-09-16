import { render, screen } from '@testing-library/react'
import { useField } from 'formik'

import { TextField, TextFieldProps } from './TextField'

const props: TextFieldProps = {
  id: 'name',
  name: 'name',
  label: 'Name'
}

const fieldMock = { value: '', name: 'name' }
const metaMock = { value: '', error: '', touched: false, initialTouched: false }

jest.mock('formik', () => ({
  __esModule: true,
  useField: jest.fn()
}))

describe('Field', () => {
  it('should show error', () => {
    const errorMock = { ...metaMock, error: 'Required', touched: true }
    const useFieldMock = useField as jest.Mock
    useFieldMock.mockImplementation(() => [fieldMock, errorMock])

    render(<TextField {...props} />)

    const field = screen.getByRole('textbox', { name: 'Name' })

    expect(field).toHaveAccessibleDescription('Required')
  })

  it('should show helper text', () => {
    const useFieldMock = useField as jest.Mock
    useFieldMock.mockImplementation(() => [
      { ...fieldMock, helperText: 'Please enter your full name.' },
      metaMock
    ])

    render(<TextField {...props} helperText="Please enter your full name" />)

    const field = screen.getByRole('textbox', { name: 'Name' })

    expect(field).toHaveAccessibleDescription('Please enter your full name')
  })
})
