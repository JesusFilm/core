import { render } from '@testing-library/react'

import { UpdateChannelModal } from './UpdateChannelModal'

describe('UpdateChannelModal', () => {
  it('renders correctly', async () => {
    let isOpen = true

    const { getByText } = render(
      <UpdateChannelModal
        data={null}
        open={isOpen}
        onClose={() => {
          isOpen = false
        }}
        onUpdate={(data) => {
          console.log(data)
        }}
      />
    )

    expect(getByText(/update channel/i)).toBeInTheDocument()
  })
})
