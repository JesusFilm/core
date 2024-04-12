import { render } from '@testing-library/react'

import { CreateShortLinkModal } from './CreateShortLinkModal'

describe('CreateShortLinkModal', () => {
  it('renders correctly', async () => {
    let isOpen = true

    const { getByText } = render(
      <CreateShortLinkModal
        open={isOpen}
        onClose={() => {
          isOpen = false
        }}
        refetch={() => console.log('Refetching...')}
      />
    )

    expect(getByText(/create short link/i)).toBeInTheDocument()
  })
})
