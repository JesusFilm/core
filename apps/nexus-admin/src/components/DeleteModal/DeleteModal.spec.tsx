import { render } from '@testing-library/react'

import { DeleteModal } from './DeleteModal'

describe('DeleteModal', () => {
  it('renders correctly', async () => {
    let isOpen = true

    const { getByText } = render(
      <DeleteModal
        content="Delete this item?"
        open={isOpen}
        onClose={() => {
          isOpen = false
        }}
        onDelete={() => {
          console.log('Deleted!')
        }}
      />
    )

    expect(getByText(/delete this item?/i)).toBeInTheDocument()
  })
})
