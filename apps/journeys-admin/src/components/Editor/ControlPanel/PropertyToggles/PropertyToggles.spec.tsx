import { render } from '@testing-library/react'
import { PropertyToggles } from '.'

describe('PropertyToggles', () => {
  it('should display properties', () => {
    const { getByRole } = render(<PropertyToggles />)
    // update tests
    expect(getByRole('button', { name: 'Align' })).not.toBeInTheDocument()
  })
})
