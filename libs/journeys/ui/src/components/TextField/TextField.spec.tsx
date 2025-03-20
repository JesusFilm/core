import { render, screen } from '@testing-library/react'
import { useFormikContext } from 'formik'
import { ComponentProps } from 'react'

import { TextField } from './TextField'

const props: ComponentProps<typeof TextField> = {
  id: 'name',
  name: 'name',
  label: 'Name'
}

const formikContextMock = {
  values: { name: '' },
  errors: {},
  touched: {},
  handleChange: jest.fn(),
  handleBlur: jest.fn()
}

jest.mock('formik', () => ({
  __esModule: true,
  useFormikContext: jest.fn()
}))

describe('TextField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show error', () => {
    const errorContextMock = {
      ...formikContextMock,
      errors: { name: 'Required' },
      touched: { name: true }
    }

    const useFormikContextMock = useFormikContext as jest.Mock
    useFormikContextMock.mockReturnValue(errorContextMock)

    render(<TextField {...props} />)

    const textField = screen.getByRole('textbox', { name: 'Name' })
    expect(textField).toHaveAccessibleDescription('Required')
  })

  it('should show helper text', () => {
    const useFormikContextMock = useFormikContext as jest.Mock
    useFormikContextMock.mockReturnValue(formikContextMock)

    render(<TextField {...props} helperText="Please enter your full name" />)

    const textField = screen.getByRole('textbox', { name: 'Name' })
    expect(textField).toHaveAccessibleDescription('Please enter your full name')
  })

  it('should work without Formik context', () => {
    const useFormikContextMock = useFormikContext as jest.Mock
    useFormikContextMock.mockReturnValue(undefined)

    render(<TextField {...props} helperText="Helper text" />)

    const textField = screen.getByRole('textbox', { name: 'Name' })
    expect(textField).toBeInTheDocument()
    expect(textField).toHaveAccessibleDescription('Helper text')
  })
})
