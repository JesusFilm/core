/* eslint-disable jest/no-identical-title */
import { render, screen } from '@testing-library/react'

import { ReportsNavigation } from './ReportsNavigation'

describe('ReportsNavigation', () => {
  it('should navigate to visitors report for desktop', () => {
    render(<ReportsNavigation destination="visitor" journeyId="journeyId" />)
    expect(
      screen.getAllByRole('link', { name: 'Visitors' })[0]
    ).toHaveAttribute('href', '/journeys/journeyId/reports/visitors')
    expect(screen.getAllByTestId('UsersProfiles2Icon')).toHaveLength(2)
  })

  it('should show all visitors if journeyId is null for desktop', () => {
    render(<ReportsNavigation destination="visitor" />)
    expect(
      screen.getAllByRole('link', { name: 'Visitors' })[0]
    ).toHaveAttribute('href', '/reports/visitors')
    expect(screen.getAllByTestId('UsersProfiles2Icon')).toHaveLength(2)
  })

  it('should navigate to visitors report for mobile', () => {
    render(<ReportsNavigation destination="visitor" journeyId="journeyId" />)
    expect(
      screen.getAllByRole('link', { name: 'Visitors' })[1]
    ).toHaveAttribute('href', '/journeys/journeyId/reports/visitors')
    expect(screen.getAllByTestId('UsersProfiles2Icon')).toHaveLength(2)
  })

  it('should show all visitors if journeyId is null for mobile', () => {
    render(<ReportsNavigation destination="visitor" />)
    expect(
      screen.getAllByRole('link', { name: 'Visitors' })[0]
    ).toHaveAttribute('href', '/reports/visitors')
    expect(screen.getAllByTestId('UsersProfiles2Icon')).toHaveLength(2)
  })

  it('should navigate to visitors report for desktop', () => {
    render(<ReportsNavigation destination="journey" journeyId="journeyId" />)
    expect(
      screen.getAllByRole('link', { name: 'Journeys' })[0]
    ).toHaveAttribute('href', '/journeys/journeyId/reports')
    expect(screen.getAllByTestId('BarGroup3Icon')).toHaveLength(2)
  })

  it('should show all visitors if journeyId is null for desktop', () => {
    render(<ReportsNavigation destination="journey" />)
    expect(
      screen.getAllByRole('link', { name: 'Journeys' })[0]
    ).toHaveAttribute('href', '/reports/journeys')
    expect(screen.getAllByTestId('BarGroup3Icon')).toHaveLength(2)
  })

  it('should navigate to visitors report for mobile', () => {
    render(<ReportsNavigation destination="journey" journeyId="journeyId" />)
    expect(
      screen.getAllByRole('link', { name: 'Journeys' })[1]
    ).toHaveAttribute('href', '/journeys/journeyId/reports')
    expect(screen.getAllByTestId('BarGroup3Icon')).toHaveLength(2)
  })

  it('should show all visitors if journeyId is null for mobile', () => {
    render(<ReportsNavigation destination="journey" />)
    expect(
      screen.getAllByRole('link', { name: 'Journeys' })[0]
    ).toHaveAttribute('href', '/reports/journeys')
    expect(screen.getAllByTestId('BarGroup3Icon')).toHaveLength(2)
  })
})
