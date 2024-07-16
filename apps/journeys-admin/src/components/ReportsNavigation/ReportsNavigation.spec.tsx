import { render, screen } from '@testing-library/react'

import { ReportsNavigation } from './ReportsNavigation'

describe('ReportsNavigation', () => {
  it('should navigate to visitors report for desktop', () => {
    render(<ReportsNavigation journeyId="journeyId" />)
    expect(
      screen.getAllByRole('link', { name: 'Visitors' })[0]
    ).toHaveAttribute('href', '/journeys/journeyId/reports/visitors')
  })

  it('should show all visitors if journeyId is null for desktop', () => {
    render(<ReportsNavigation />)
    expect(
      screen.getAllByRole('link', { name: 'Visitors' })[0]
    ).toHaveAttribute('href', '/reports/visitors')
  })

  it('should navigate to visitors report for mobile', () => {
    render(<ReportsNavigation journeyId="journeyId" />)
    expect(
      screen.getAllByRole('link', { name: 'Visitors' })[1]
    ).toHaveAttribute('href', '/journeys/journeyId/reports/visitors')
  })

  it('should show all visitors if journeyId is null for mobile', () => {
    render(<ReportsNavigation />)
    expect(
      screen.getAllByRole('link', { name: 'Visitors' })[0]
    ).toHaveAttribute('href', '/reports/visitors')
  })
})
