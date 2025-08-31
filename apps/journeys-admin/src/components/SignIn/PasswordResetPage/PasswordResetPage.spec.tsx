import { fireEvent, render, waitFor } from '@testing-library/react'
import { sendPasswordResetEmail } from 'firebase/auth'

import { PasswordResetPage } from './PasswordResetPage'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  sendPasswordResetEmail: jest.fn()
}))

describe('PasswordResetPage', () => {
  const mockSetActivePage = jest.fn()

  it('should render elements with default user email', () => {
    const { getByText, getByRole } = render(
      <PasswordResetPage
        userEmail="test@example.com"
        setActivePage={mockSetActivePage}
      />
    )

    expect(getByText('Reset Password')).toBeInTheDocument()
    expect(
      getByText(
        'Get instructions sent to this email that explain how to reset your password.'
      )
    ).toBeInTheDocument()
    expect(getByRole('textbox')).toHaveValue('test@example.com')
  })

  it('should trigger cancel button click', () => {
    const { getByRole } = render(
      <PasswordResetPage
        userEmail="test@example.com"
        setActivePage={mockSetActivePage}
      />
    )
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(mockSetActivePage).toHaveBeenCalledWith('password')
  })

  it('should trigger send button click', async () => {
    const mockSendPasswordResetEmail =
      sendPasswordResetEmail as jest.MockedFunction<
        typeof sendPasswordResetEmail
      >

    const { getByRole } = render(
      <PasswordResetPage
        userEmail="test@example.com"
        setActivePage={mockSetActivePage}
      />
    )
    fireEvent.click(getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(mockSendPasswordResetEmail).toHaveBeenCalled()
    })
  })
})
