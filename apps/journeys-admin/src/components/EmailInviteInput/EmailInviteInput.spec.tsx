import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { EmailInviteInput } from './EmailInviteInput'

describe('EmailInviteInput', () => {
  it('should validate when fields are empty', async () => {
    const { getByTestId, getAllByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteInput />
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByTestId('AddCircleOutlineIcon'))
    await waitFor(() => {
      const inlineErrors = getAllByText('Required')
      expect(inlineErrors[0]).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should validate when email is invalid', async () => {
    const { getByLabelText, getByTestId, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteInput />
        </MockedProvider>
      </SnackbarProvider>
    )
    const email = getByLabelText('Add Editor By Email')

    fireEvent.change(email, {
      target: { value: '123abc@' }
    })
    fireEvent.click(getByTestId('AddCircleOutlineIcon'))

    await waitFor(() => {
      const inlineError = getByText(
        'You entered an invalid or incorrect email address'
      )
      expect(inlineError).toHaveProperty('id', 'email-helper-text')
    })
  })
})
