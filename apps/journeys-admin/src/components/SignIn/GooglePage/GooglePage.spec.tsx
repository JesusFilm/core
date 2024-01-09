import { render } from '@testing-library/react'

import { ActivePage } from '../SignIn'

import { GooglePage } from './GooglePage'

const userEmail = 'test@exampleemail.com'

describe('GooglePage', () => {
  it('should render useremail', () => {
    const { getByText } = render(
      <GooglePage
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
    expect(getByText('Google to continue')).toBeInTheDocument()
  })
})
