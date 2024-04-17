import { render } from '@testing-library/react'

import { DiscoveryJourneys } from '.'

describe('DiscoveryJourneys', () => {
  it('should show embed journeys', () => {
    const { getByLabelText } = render(<DiscoveryJourneys />)
    expect(getByLabelText('admin-left-embedded')).toBeInTheDocument()
    expect(getByLabelText('admin-center-embedded')).toBeInTheDocument()
    expect(getByLabelText('admin-right-embedded')).toBeInTheDocument()
  })
})
