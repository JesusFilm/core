import { fireEvent, render } from '@testing-library/react'

import { PasswordResetPage } from './PasswordResetPage' // Adjust the path based on your project structure

describe('PasswordResetPage', () => {
  const mockSetActivePage = jest.fn()

  it('should render with default user email', () => {
    const { getByText, getByRole } = render(
      <PasswordResetPage
        userEmail="test@example.com"
        setActivePage={mockSetActivePage}
      />
    )

    // Ensure that the component renders with the default user email
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
    // Ensure that the setActivePage function is called with the correct argument
    expect(mockSetActivePage).toHaveBeenCalledWith('password')
  })
})
