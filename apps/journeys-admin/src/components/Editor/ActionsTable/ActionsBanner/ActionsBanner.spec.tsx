import { render } from '@testing-library/react'
import { ActionsBanner } from './ActionsBanner'

describe('ActionsBanner', () => {
  it('should show actions banner', () => {
    const { getByText } = render(<ActionsBanner />)
    expect(getByText('Every Journey has a goal')).toBeInTheDocument()
  })
})
