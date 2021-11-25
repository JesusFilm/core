import { render } from '@testing-library/react'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import JourneyCardMenu from '.'

describe('JourneyCardMenu', () => {
  it('should open menu on click', () => {
    render(
      <JourneyCardMenu status={JourneyStatus.draft} slug={'draft-journey'} />
    )
    // check all 4 aria props :
    // aria-expanded, aria-labelledby aria-controls, aria-haspopup
  })
  it('should handle edit journey', () => {
    // const { getAllByText } = render(<JourneyCardMenu />)
    // expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
  it('should handle changing journey access', () => {
    // const { getAllByText } = render(<JourneyCardMenu />)
    // expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
  it('should handle preview', () => {
    // const { getAllByText } = render(<JourneyCardMenu />)
    // expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
})
