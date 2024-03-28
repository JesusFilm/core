import { render } from '@testing-library/react'

import { LocalizationTable } from './LocalizationTable'

describe('LocalizationTable', () => {
  it('renders correctly', async () => {
    const { getByText } = render(
      <LocalizationTable data={[]} loading={false} />
    )

    expect(getByText(/language/i)).toBeInTheDocument()
  })
})
