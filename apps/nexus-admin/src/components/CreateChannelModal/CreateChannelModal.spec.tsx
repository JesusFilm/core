import { fireEvent, render } from '@testing-library/react'

import { CreateChannelModal } from './CreateChannelModal'

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

  it('calls on close', () => {
    const handleClose = jest.fn()
    const { getByText } = render(
      <CreateChannelModal
        open
        onClose={handleClose}
        onCreate={(data) => {
          console.log(data)
        }}
      />
    )
    fireEvent.click(getByText(/cancel/i))
    expect(handleClose).toHaveBeenCalled()
  })
})
