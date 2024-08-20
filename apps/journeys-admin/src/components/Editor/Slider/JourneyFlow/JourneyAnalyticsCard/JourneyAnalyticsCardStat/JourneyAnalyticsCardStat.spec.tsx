import { render, screen } from '@testing-library/react'

import { JourneyAnalyticsCardStat } from '.'

describe('NumberStat', () => {
  it('should render', () => {
    render(<JourneyAnalyticsCardStat label="Visitors" count={10} />)

    expect(screen.getByText('Visitors')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should use compact format', () => {
    render(<JourneyAnalyticsCardStat label="Visitors" count={1000} />)

    expect(screen.getByText('1K')).toBeInTheDocument()
  })
})
