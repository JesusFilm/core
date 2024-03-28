import { render } from '@testing-library/react'

import { ChannelTable } from './ChannelTable'

describe('ChannelTable', () => {
  it('renders correctly', async () => {
    const { getByText } = render(<ChannelTable data={[]} loading={false} />)

    expect(getByText(/channel name/i)).toBeInTheDocument()
  })
})
