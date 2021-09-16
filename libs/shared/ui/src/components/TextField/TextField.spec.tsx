
import { render, screen } from '@testing-library/react'
import { useField } from 'formik'

import TextField, { TextFieldProps } from './TextField'

// Should limit to use only within a form - not outside
const props: TextFieldProps = {
  id: 'name',
  name: 'name',
  label: 'Name'
}

const fieldMock = { value: '', name: 'name' }
const metaMock = { value: '', error: '', touched: false, initialTouched: false }

jest.mock('formik', () => ({
  __esModule: true,
  useField: jest.fn(() => {
    return [fieldMock, metaMock]
  })
}))

describe('TextField', () => {
  it('should show errors when', () => {
    const errorMock = { ...metaMock, error: 'Required', touched: true }
    useField.mockImplementation(() => [fieldMock, errorMock])

    render(<TextField {...props} />)

    const inlineErrors = screen.getAllByText('Required')

    expect(inlineErrors[0]).toHaveProperty('id', 'name-helper-text')
  })
})
