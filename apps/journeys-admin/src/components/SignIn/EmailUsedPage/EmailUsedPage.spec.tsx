import { render } from '@testing-library/react'

import { EmailUsedPage } from './EmailUsedPage'

describe('EmailUsedPage', () => {
  it('should render if account has been registered with Google', () => {
    const { getByText } = render(
      <EmailUsedPage userEmail="test@exampleemail.com" variant="Google" />
    )

    expect(getByText('You already have an account')).toBeInTheDocument()
    expect(getByText("You've already used")).toBeInTheDocument()
    expect(getByText('test@exampleemail.com.')).toBeInTheDocument()
    expect(getByText('Sign in with Google to continue.')).toBeInTheDocument()
  })

  it('should render if account has been registered with Facebook', () => {
    const { getByText } = render(
      <EmailUsedPage userEmail="test@exampleemail.com" variant="Facebook" />
    )

    expect(getByText('You already have an account')).toBeInTheDocument()
    expect(getByText("You've already used")).toBeInTheDocument()
    expect(getByText('test@exampleemail.com.')).toBeInTheDocument()
    expect(getByText('Sign in with Facebook to continue.')).toBeInTheDocument()
  })
})
