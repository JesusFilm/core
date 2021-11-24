import { renderWithApolloClient } from '../../../../test/testingLibrary'
import { SignIn } from '.'

describe('Sign In', () => {
  it('should render sign in options', () => {
    const { getByTestId } = renderWithApolloClient(<SignIn />)
    expect(getByTestId('firebaseui')).toHaveClass('firebaseui-container')
  })
})
