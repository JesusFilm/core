import { render } from '@testing-library/react'
import { ReportButtons } from './ReportButtons'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('ReportButtons', () => {
  it('should link to reports', async () => {
    const { getByRole } = render(<ReportButtons selected="journeys" />)
    expect(getByRole('link', { name: 'Visitors' })).toHaveAttribute(
      'href',
      '/reports/visitors'
    )
    expect(getByRole('link', { name: 'Journeys' })).toHaveAttribute(
      'href',
      '/reports/journeys'
    )
  })

  it('should display selected button for report type ', async () => {
    const { getByRole } = render(<ReportButtons selected="visitors" />)

    expect(getByRole('link', { name: 'Visitors' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})
