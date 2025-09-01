import { render } from '@testing-library/react'

import { EmailUsedPage } from '.'

describe('EmailUsedPage', () => {
  it('should render if account has been registered with Google', () => {
    const { getByText, getByRole } = render(
      <EmailUsedPage
        userEmail="test@exampleemail.com"
        activePage="google.com"
      />
    )

    expect(getByText('You already have an account')).toBeInTheDocument()
    expect(
      getByText("You've already used test@exampleemail.com", { exact: false })
    ).toBeInTheDocument()
    expect(
      getByText('Sign in with Google to continue', { exact: false })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Continue with Google' })
    ).toBeInTheDocument()
  })

})
