import { render } from '@testing-library/react'

import { ResetPasswordSentPage } from './ResetPasswordSentPage'

describe('ResetPasswordSentPage', () => {
  it('should render if account has been registered with Google', () => {
    const { getByText } = render(
      <ResetPasswordSentPage
        userEmail="test@exampleemail.com"
        activePage="google.com"
      />
    )

    expect(getByText('Check your email')).toBeInTheDocument()
    expect(
      getByText('Follow the instructions sent to', { exact: false })
    ).toBeInTheDocument()
    expect(getByText('test@exampleemail.com')).toBeInTheDocument()
    expect(
      getByText('to recover your password', { exact: false })
    ).toBeInTheDocument()
  })
})
