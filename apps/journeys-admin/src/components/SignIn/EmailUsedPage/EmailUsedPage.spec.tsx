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
      getByText("You've already used", { exact: false })
    ).toBeInTheDocument()
    expect(getByText('test@exampleemail.com')).toBeInTheDocument()
    expect(
      getByText('Sign in with Google to continue', { exact: false })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Sign in with Google' })
    ).toBeInTheDocument()
  })

  it('should render if account has been registered with Facebook', () => {
    const { getByText, getByRole } = render(
      <EmailUsedPage
        userEmail="test@exampleemail.com"
        activePage="facebook.com"
      />
    )

    expect(getByText('You already have an account')).toBeInTheDocument()
    expect(
      getByText("You've already used", { exact: false })
    ).toBeInTheDocument()
    expect(getByText('test@exampleemail.com')).toBeInTheDocument()
    expect(
      getByText('Sign in with Facebook to continue', { exact: false })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Sign in with Facebook' })
    ).toBeInTheDocument()
  })
})
