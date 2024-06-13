import { render } from '@testing-library/react'

import { BatchesTable } from './BatchesTable'

describe('BatchesTable', () => {
  it('renders correctly', async () => {
    const { getByText } = render(<BatchesTable data={[]} loading={false} />)

    expect(getByText(/batches/i)).toBeInTheDocument()
  })
})
