import { render } from '@testing-library/react'
import { SignIn } from '.'

describe('Sign In', () => {
  it('should render sign in options', () => {
    const { getByTestId } = render(<SignIn />)
    expect(getByTestId('firebaseui')).toHaveClass('firebaseui-container')
  })
})
