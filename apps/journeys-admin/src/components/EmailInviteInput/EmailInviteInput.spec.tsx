import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { EmailInviteInput } from './EmailInviteInput'

describe('EmailInviteInput', () => {
  const onClose = jest.fn()
  it('should validate when fields are empty', async () => {
    const { getByRole, getAllByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteInput onClose={onClose} />
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      const inlineErrors = getAllByText('Required')
      expect(inlineErrors[0]).toHaveProperty('id', 'email-helper-text')
      expect(inlineErrors[1]).toHaveProperty('id', 'name-helper-text')
    })
  })

  it('should validate when name is too short', async () => {
    const { getByLabelText, getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteInput onClose={onClose} />
        </MockedProvider>
      </SnackbarProvider>
    )
    const name = getByLabelText('Display Name')

    fireEvent.change(name, { target: { value: 'S' } })
    fireEvent.click(getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      const inlineError = getByText('Name must be 2 characters or more')
      expect(inlineError).toHaveProperty('id', 'name-helper-text')
    })
  })

  it('should validate when name is too long', async () => {
    const { getByLabelText, getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteInput onClose={onClose} />
        </MockedProvider>
      </SnackbarProvider>
    )
    const name = getByLabelText('Display Name')

    fireEvent.change(name, {
      target: { value: '123456789012345678901234567890123456789012345678901' }
    })
    fireEvent.click(getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      const inlineError = getByText('Name must be 50 characters or less')
      expect(inlineError).toHaveProperty('id', 'name-helper-text')
    })
  })

  it('should validate when email is invalid', async () => {
    const { getByLabelText, getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteInput onClose={onClose} />
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
