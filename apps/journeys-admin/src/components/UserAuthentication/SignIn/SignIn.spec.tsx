import { render } from '@testing-library/react'
import { AuthProvider } from '../../../../src/libs/firebaseClient'
import { SignIn } from '.'

describe('Sign In', () => {
  it('should render sign in options', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <SignIn />
      </AuthProvider>
    )
    expect(getByTestId('firebaseui')).toHaveClass('firebaseui-container')
  })
})
