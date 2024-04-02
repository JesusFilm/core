import { render } from '@testing-library/react'

import { AuthLayout } from './AuthLayout'

describe('AuthLayout', () => {
  it('renders correctly', async () => {
    const { getByText } = render(
      <AuthLayout>
        <span>Content here</span>
      </AuthLayout>
    )

    expect(getByText(/content here/i)).toBeInTheDocument()
  })
})
