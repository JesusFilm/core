import { render, screen } from '@testing-library/react'
import { useField } from 'formik'

import { FormTextArea } from './FormTextArea'

jest.mock('next/font/google', () => ({
  Inter: () => ({
    style: {
      fontFamily: 'mocked'
    }
  })
}))

const props = {
  name: 'name',
  label: 'FormTextArea'
}

const fieldMock = { value: 'Textarea value', name: 'name' }
const metaMock = { value: '', error: '', touched: false, initialTouched: false }

jest.mock('formik', () => ({
  __esModule: true,
  useField: jest.fn()
}))

const useFieldMock = useField as jest.Mock

describe('FormTextArea', () => {
  it('should render with value', () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock])
    render(<FormTextArea {...props} />)

    const field = screen.getByRole('textbox', { name: 'FormTextArea' })
    expect(field).toBeInTheDocument()
    expect(field).toHaveValue('Textarea value')
  })

  it('should show helper text', () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock])
    render(<FormTextArea {...props} helperText="Helper text" />)

    const field = screen.getByRole('textbox', { name: 'FormTextArea' })
    expect(field).toHaveAccessibleDescription('Helper text')
  })

  it('should show error', () => {
    useFieldMock.mockImplementation(() => [
      fieldMock,
      { ...metaMock, error: 'Required', touched: true }
    ])
    render(<FormTextArea {...props} />)

    expect(screen.getByText('Required')).toBeInTheDocument()
  })
})
