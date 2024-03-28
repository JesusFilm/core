import { render } from '@testing-library/react'

import { ViewResourceTableModal } from './ViewResourceTableModal'

describe('ViewResourceTableModal', () => {
  it('renders correctly', async () => {
    let isOpen = true

    const { getByText } = render(
      <ViewResourceTableModal
        open={isOpen}
        closeModal={() => {
          isOpen = false
        }}
        columnsVisibility={{
          column: true
        }}
        toggleColumnVisibility={(column, value) => {
          console.log({
            [column]: value
          })
        }}
        allColumnsVisibility={() => {
          console.log('all visibile')
        }}
        resetColumnsVisibility={() => {
          console.log('reset')
        }}
      />
    )

    expect(getByText(/select columns/i)).toBeInTheDocument()
  })
})
