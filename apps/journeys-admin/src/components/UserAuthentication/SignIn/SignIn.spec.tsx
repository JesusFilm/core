import { renderWithApolloClient } from '../../../../test/testingLibrary'
import { SignIn, USER_CREATE } from '.'
import { MockedProvider } from '@apollo/client/testing'

describe('Sign In', () => {
  // fix test
  it('should render sign in options', () => {
    const { unmount } = renderWithApolloClient(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_CREATE,
              variables: {
                id: 'uid',
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'email',
                imageUrl: 'imageUrl'
              }
            },
            result: {
              data: {
                id: 'uid',
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'email',
                imageUrl: 'imageUrl'
              }
            }
          }
        ]}
      >
        <SignIn />
      </MockedProvider>
    )
    unmount()
  })
})
