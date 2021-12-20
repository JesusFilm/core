import { render } from '@testing-library/react'
import { JourneyCardMenu } from '.'

describe('JourneyCardMenu', () => {
  it('should open menu on click', () => {
    render(<JourneyCardMenu />)
    // check all 4 aria props :
    // aria-expanded, aria-labelledby aria-controls, aria-haspopup
  })
  it('should handle edit journey', () => {
    // const { getAllByText } = render(<JourneyCardMenu />)
    // expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
  it('should handle duplicate journey', () => {
    // const { getAllByText } = render(<JourneyCardMenu />)
    // expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
  it('should handle changing journey access', () => {
    // const { getAllByText } = render(<JourneyCardMenu />)
    // expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
  it('should handle copy url', () => {
    // const { getAllByText } = render(<JourneyCardMenu />)
    // expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
})
