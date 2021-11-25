import { render } from '@testing-library/react'
import { SortBy } from '.'
import JourneySort from './JourneySort'

describe('JourneySort', () => {
  it('should render Journey Sort', () => {
    render(
      <JourneySort
        sortBy={SortBy.UNDEFINED}
        setSortBy={() => {
          console.log()
        }}
      />
    )
    // Check elements display with correct values
    // expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
})
