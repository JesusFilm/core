import { render } from '@testing-library/react'

import { PublisherInvite } from './PublisherInvite'

describe('PublisherInvite', () => {
  it('should render access denied message', () => {
    const { getByText } = render(<PublisherInvite />)
    expect(getByText('You need access')).toBeInTheDocument()
    expect(
      getByText('You need to be a publisher to view this template.')
    ).toBeInTheDocument()
  })
})
