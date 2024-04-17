import { render } from '@testing-library/react'

import { SignIn } from './SignIn'

describe('SignIn', () => {
  it('should render sign in page', () => {
    const { getByRole } = render(<SignIn />)
    expect(getByRole('tab', { name: 'New account' })).toHaveTextContent(
      'New account'
    )
  })
})
