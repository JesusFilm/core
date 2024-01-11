import { fireEvent, render } from '@testing-library/react'

import { PasswordResetPage } from './PasswordResetPage'

describe('PasswordResetPage', () => {
  const mockSetActivePage = jest.fn()

  it('should render with default user email', () => {
    const { getByText, getByRole } = render(
      <PasswordResetPage
        userEmail="test@example.com"
        setActivePage={mockSetActivePage}
      />
    )

    expect(getByText('Sign In')).toBeInTheDocument()
    expect(
      getByText(
        'Get instructions sent to this email that explain how to reset your password'
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
    fireEvent.click(getByRole('button', { name: 'CANCEL' }))
    expect(mockSetActivePage).toHaveBeenCalledWith('password')
  })
})
