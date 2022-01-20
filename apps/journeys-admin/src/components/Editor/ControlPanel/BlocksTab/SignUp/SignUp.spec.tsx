import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SignUp } from '.'

describe('SignUp', () => {
  it('should render the SignUp button', () => {
    const { getByText } = render(
      <MockedProvider>
        <SignUp />
      </MockedProvider>
    )
    expect(getByText('Subscribe')).toBeInTheDocument()
  })
})
