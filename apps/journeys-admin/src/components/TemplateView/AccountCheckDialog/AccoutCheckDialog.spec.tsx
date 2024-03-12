import { fireEvent, render } from '@testing-library/react'

import { AccountCheckDialog } from './AccountCheckDialog'

describe('AccountCheckDialog', () => {
  const onClose = jest.fn()
  const handleSignIn = jest.fn()

  it('should call handleSignIn when login is clicked', () => {
    const { getByRole } = render(
      <AccountCheckDialog open onClose={onClose} handleSignIn={handleSignIn} />
    )

    fireEvent.click(getByRole('button', { name: 'Login with my account' }))
    expect(handleSignIn).toHaveBeenCalled()
  })

  it('should call handleSignIn when create account is clicked', () => {
    const { getByRole } = render(
      <AccountCheckDialog open onClose={onClose} handleSignIn={handleSignIn} />
    )

    fireEvent.click(getByRole('button', { name: 'Create a new account' }))
    expect(handleSignIn).toHaveBeenCalled()
  })
})
