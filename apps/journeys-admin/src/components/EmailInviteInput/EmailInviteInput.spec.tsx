import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { EmailInviteInput } from './EmailInviteInput'

describe('EmailInviteInput', () => {
  it('should validate when fields are empty', async () => {
    const { getByRole, getAllByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteInput />
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      const inlineErrors = getAllByText('Required')
      expect(inlineErrors[0]).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should validate when email is invalid', async () => {
    const { getByLabelText, getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteInput />
        </MockedProvider>
      </SnackbarProvider>
    )
    const email = getByLabelText('Email Address')

    fireEvent.change(email, {
      target: { value: '123abc@' }
    })
    fireEvent.click(getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      const inlineError = getByText('Please enter a valid email address')
      expect(inlineError).toHaveProperty('id', 'email-helper-text')
    })
  })
})
