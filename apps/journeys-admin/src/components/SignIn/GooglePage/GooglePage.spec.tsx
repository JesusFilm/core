import { render } from '@testing-library/react'

import { GooglePage } from './GooglePage'

describe('GooglePage', () => {
  it('should render useremail', () => {
    const { getByText } = render(
      <GooglePage userEmail="test@exampleemail.com" setActivePage={jest.fn()} />
    )

    expect(getByText('Sign In')).toBeInTheDocument()
    expect(getByText('You already have an account')).toBeInTheDocument()
    expect(getByText("You've already used")).toBeInTheDocument()
    expect(getByText('Sign in with')).toBeInTheDocument()
    expect(getByText('Google to continue')).toBeInTheDocument()
  })
})
