import { render } from '@testing-library/react'

import { ActivePage } from '../SignIn'

import { FacebookPage } from './FaceBookPage'

const userEmail = 'test@exampleemail.com'

describe('FacebookPage', () => {
  it('should render useremail', () => {
    const { getByText } = render(
      <FacebookPage
        userEmail={userEmail}
        setActivePage={function (activePage: ActivePage): void {
          throw new Error('Function not implemented.')
        }}
      />
    )

    expect(getByText('Sign In')).toBeInTheDocument()
    expect(getByText('You already have an account')).toBeInTheDocument()
    expect(getByText("You've already used")).toBeInTheDocument()
    expect(getByText('Sign in with')).toBeInTheDocument()
    expect(getByText('Facebook to continue')).toBeInTheDocument()
  })
})
