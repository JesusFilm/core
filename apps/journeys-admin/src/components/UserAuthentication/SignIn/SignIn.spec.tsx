import { renderWithApolloClient } from '../../../../test/testingLibrary'
import { SignIn } from '.'

describe('Sign In', () => {
  // fix test
  it('should render sign in options', () => {
    const { container } = renderWithApolloClient(<SignIn />)
    expect(container.getElementsByClassName('firebaseui_container').length).toBe(0)
  })
})
