import { render, screen } from '@testing-library/react'
import { useField } from 'formik'

import { FormCheckbox } from './FormCheckbox'
import userEvent from '@testing-library/user-event'

const props = {
  name: 'name',
  label: 'FormTextField'
}

const fieldMock = { value: false, name: 'checkbox' }
const metaMock = {
  value: false,
  error: '',
  touched: false,
  initialTouched: false
}

jest.mock('formik', () => ({
  __esModule: true,
  useField: jest.fn()
}))

const useFieldMock = useField as jest.Mock

describe('FormCheckbox', () => {
  it('should render with value', () => {
    useFieldMock.mockImplementation(() => [
      fieldMock,
      metaMock,
      { setValue: jest.fn() }
    ])
    render(<FormCheckbox {...props} />)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should set value when checkbox is clicked', async () => {
    const setValueMock = jest.fn()
    useFieldMock.mockImplementation(() => [
      fieldMock,
      metaMock,
      { setValue: setValueMock }
    ])
    render(<FormCheckbox {...props} />)

    const user = userEvent.setup()

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(setValueMock).toHaveBeenCalledWith(true)
  })
})
