import { render } from '@testing-library/react'

import { Modal } from './Modal'

describe('Modal', () => {
  it('renders correctly', async () => {
    let isOpen = true

    const { getByText } = render(
      <Modal
        open={isOpen}
        title="Hello"
        handleClose={() => {
          isOpen = false
        }}
        actions={<button>Cancel</button>}
      >
        <input />
      </Modal>
    )

    expect(getByText(/hello/i)).toBeInTheDocument()
    expect(getByText(/cancel/i)).toBeInTheDocument()
  })
})
