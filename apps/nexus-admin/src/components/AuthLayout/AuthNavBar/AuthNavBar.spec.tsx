import { render } from '@testing-library/react'

import { AuthNavBar } from './AuthNavBar'

describe('AuthNavBar', () => {
  it('renders correctly', async () => {
    const { getByText } = render(<AuthNavBar />)

    expect(getByText(/Youtube Uploader/i)).toBeInTheDocument()
  })
})
