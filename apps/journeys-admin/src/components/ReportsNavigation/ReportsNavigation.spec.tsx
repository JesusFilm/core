import { render } from '@testing-library/react'

import { JourneysReportType } from '../../../__generated__/globalTypes'

import { ReportsNavigation } from './ReportsNavigation'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('ReportsNavigation', () => {
  it('should should select journeys', () => {
    const { getByRole } = render(<ReportsNavigation selected="journeys" />)
    expect(getByRole('link', { name: 'Journeys' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(getByRole('link', { name: 'Visitors' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  it('should should select visitors', () => {
    const { getByRole } = render(<ReportsNavigation selected="visitors" />)
    expect(getByRole('link', { name: 'Visitors' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(getByRole('link', { name: 'Journeys' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  it('should navigate to single journey report', () => {
    const { getByRole } = render(
      <ReportsNavigation
        reportType={JourneysReportType.singleFull}
        journeyId="test"
        selected="visitors"
      />
    )
    expect(getByRole('link', { name: 'Journeys' })).toHaveAttribute(
      'href',
      '/journeys/test/reports'
    )
  })

  it('should navigate to single visitor report', () => {
    const { getByRole } = render(
      <ReportsNavigation
        reportType={JourneysReportType.singleFull}
        journeyId="test"
        selected="visitors"
      />
    )
    expect(getByRole('link', { name: 'Visitors' })).toHaveAttribute(
      'href',
      '/journeys/test/reports/visitors'
    )
  })

  it('should navigate to multiple journeys report', () => {
    const { getByRole } = render(
      <ReportsNavigation
        reportType={JourneysReportType.multipleFull}
        selected="visitors"
      />
    )
    expect(getByRole('link', { name: 'Journeys' })).toHaveAttribute(
      'href',
      '/reports/journeys'
    )
  })

  it('should navigate to multiple visitors report', () => {
    const { getByRole } = render(
      <ReportsNavigation
        reportType={JourneysReportType.multipleFull}
        selected="visitors"
      />
    )
    expect(getByRole('link', { name: 'Visitors' })).toHaveAttribute(
      'href',
      '/reports/visitors'
    )
  })
})
