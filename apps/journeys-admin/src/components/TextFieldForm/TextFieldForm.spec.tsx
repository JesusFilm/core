import { fireEvent, render, waitFor } from '@testing-library/react'
import Search from '@mui/icons-material/Search'
import { object, string } from 'yup'
import { TextFieldForm } from './TextFieldForm'

describe('TextFieldForm', () => {
  it('should render TextFieldForm', () => {
    const { getByText, getByRole, getByTestId } = render(
      <TextFieldForm
        id="TextField form"
        label="Navigate to..."
        initialValues="Default Value"
        placeholder="Placeholder Value"
        inputProps={{
          'data-testid': 'TextField form',
          'aria-label': 'Search'
        }}
        handleSubmit={jest.fn()}
        endIcon={<Search />}
      />
    )
    const textField = getByRole('textbox')
    expect(getByText('Navigate to...')).toBeInTheDocument()
    expect(textField).toHaveAttribute('id', 'TextField form')
    expect(textField).toHaveAttribute('value', 'Default Value')
    expect(textField).toHaveAttribute('placeholder', 'Placeholder Value')
    expect(textField).toHaveAttribute('aria-label', 'Search')
    expect(getByTestId('TextField form')).toBeInTheDocument()
    expect(getByTestId('SearchIcon'))
  })

  it('should show helper text if present', () => {
    const { getByText } = render(
      <TextFieldForm
        label="Navigate to..."
        initialValues="Default Value"
        helperText="Label goes here"
        handleSubmit={jest.fn()}
      />
    )
    expect(getByText('Label goes here')).toBeInTheDocument()
  })

  it('should call handleSubmit on enter keypress', async () => {
    const handleSubmit = jest.fn()
    const { getByRole, getByText } = render(
      <TextFieldForm
        label="Navigate to..."
        initialValues="Default Value"
        handleSubmit={handleSubmit}
      />
    )
    expect(getByText('Navigate to...')).toBeInTheDocument()
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'google.com' }
    })
    fireEvent.submit(getByRole('textbox'), { target: { value: 'google.com' } })
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  it('should show error', async () => {
    const validationSchema = object({
      link: string().required('This field is required')
    })

    const { getByRole, getByText } = render(
      <TextFieldForm
        id="link"
        label="Navigate to..."
        initialValues=""
        validationSchema={validationSchema}
        handleSubmit={jest.fn()}
      />
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: '' }
    })
    fireEvent.blur(getByRole('textbox'), { target: { value: '' } })

    await waitFor(() => {
      expect(getByText('This field is required')).toBeInTheDocument()
    })
  })

  it('should call handleSubmit on blur', async () => {
    const handleSubmit = jest.fn()
    const validationSchema = object({
      link: string().required('This field is required')
    })

    const { getByRole } = render(
      <TextFieldForm
        id="link"
        label="Navigate to..."
        initialValues="https://google.com"
        validationSchema={validationSchema}
        handleSubmit={handleSubmit}
      />
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'google.com' }
    })
    fireEvent.blur(getByRole('textbox'), { target: { value: 'google.com' } })
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
