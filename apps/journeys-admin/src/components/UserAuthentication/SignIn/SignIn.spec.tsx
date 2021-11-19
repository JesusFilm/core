import { render } from '@testing-library/react'
import { SignIn } from '.'

describe('Sign In', () => {
  // TODO: Write a test for signin
  it('should render Email as a sign-in option', () => {
    const { getByRole } = render(<SignIn />)
    expect(getByRole('button')).toHaveClass('firebaseui-idp-password')
  })
})
