import { fireEvent, render, waitFor } from '@testing-library/react'
import EditRounded from '@mui/icons-material/EditRounded'
import { TextFieldForm } from './TextFieldForm'

describe('TextFieldForm', () => {
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
  it('should render with start icon', () => {
    const { getByTestId } = render(
      <TextFieldForm
        label="Navigate to..."
        initialValues="Default Value"
        handleSubmit={jest.fn()}
        startIcon={<EditRounded />}
        iconPosition="start"
      />
    )
    expect(getByTestId('EditRoundedIcon'))
  })

  it('should render with end icon', () => {
    const { getByTestId } = render(
      <TextFieldForm
        label="Navigate to..."
        initialValues="Default Value"
        handleSubmit={jest.fn()}
        endIcon={<EditRounded />}
        iconPosition="end"
      />
    )
    expect(getByTestId('EditRoundedIcon'))
  })
})
