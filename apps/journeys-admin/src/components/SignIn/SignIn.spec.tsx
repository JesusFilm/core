import { render } from '@testing-library/react'

import { SignIn } from './SignIn'

describe('SignIn', () => {
  it('should render access denied message', () => {
    const { getByText } = render(<SignIn />)
    expect(getByText('You need access')).toBeInTheDocument()
    expect(
      getByText('You need to be a publisher to view this template.')
    ).toBeInTheDocument()
  })
})
