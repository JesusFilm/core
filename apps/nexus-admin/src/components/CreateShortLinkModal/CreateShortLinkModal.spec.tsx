import { render } from '@testing-library/react'

import { CreateChannelModal } from './CreateShortLinkModal'

describe('CreateChannelModal', () => {
  it('renders correctly', async () => {
    let isOpen = true

    const { getByText } = render(
      <CreateChannelModal
        open={isOpen}
        onClose={() => {
          isOpen = false
        }}
        onCreate={(data) => {
          console.log(data)
        }}
      />
    )

    expect(getByText(/connect channel/i)).toBeInTheDocument()
  })
})
