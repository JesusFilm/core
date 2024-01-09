import { render } from '@testing-library/react'

import { SignIn } from './SignIn'

describe('SignIn', () => {
  it('should render sign in page', () => {
    const { getByRole } = render(<SignIn />)
    expect(getByRole('link', { name: 'Need help?' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'Need help?' })).toHaveAttribute(
      'href',
      'mailto:support@nextstep.is?Subject=Support%2FFeedback%20Request'
    )
  })
})
