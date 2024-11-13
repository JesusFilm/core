import { render, screen } from '@testing-library/react'
import { useField } from 'formik'

import { FormCheckbox } from './FormCheckbox'

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

describe('FormCheckbox', () => {
  it('should render with value', () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock])
    render(<FormCheckbox {...props} />)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })
})
