import { render } from '@testing-library/react'

import { UpdateResourceModal } from './UpdateResourceModal'

describe('UpdateResourceModal', () => {
  it('renders correctly', async () => {
    let isOpen = true

    const { getByText } = render(
      <UpdateResourceModal
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

    expect(getByText(/update resource/i)).toBeInTheDocument()
  })
})
