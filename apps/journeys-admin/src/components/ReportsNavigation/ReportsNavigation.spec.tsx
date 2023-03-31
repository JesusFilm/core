import { render } from '@testing-library/react'
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
})
