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

describe('TextField', () => {
  it('should show correct error', () => {
    const errorMock = { ...metaMock, error: 'Required', touched: true }
    const useFieldMock = useField as jest.Mock
    useFieldMock.mockImplementation(() => [fieldMock, errorMock])

    render(<TextField {...props} />)

    const inlineErrors = screen.getAllByText('Required')

    expect(inlineErrors[0]).toHaveProperty('id', 'name-helper-text')
  })
})
