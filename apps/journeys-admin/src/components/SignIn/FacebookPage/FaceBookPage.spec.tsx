import { render } from '@testing-library/react'

import { FacebookPage } from './FaceBookPage'

describe('FacebookPage', () => {
  it('should render useremail', () => {
    const { getByText } = render(
      <FacebookPage
        userEmail="test@exampleemail.com"
        setActivePage={jest.fn()}
      />
    )

    expect(getByText('Sign In')).toBeInTheDocument()
    expect(getByText('You already have an account')).toBeInTheDocument()
    expect(getByText("You've already used")).toBeInTheDocument()
    expect(getByText('Sign in with')).toBeInTheDocument()
    expect(getByText('Facebook to continue')).toBeInTheDocument()
  })
})
