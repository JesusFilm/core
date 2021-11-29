import { render } from '@testing-library/react'
import ShareSection from '.'

describe('JourneyShare', () => {
  it('should render', () => {
    render(<ShareSection slug={'my-journey'} />)
  })
})
