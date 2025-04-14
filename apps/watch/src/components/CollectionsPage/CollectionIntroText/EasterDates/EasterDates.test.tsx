import { fireEvent, render, screen } from '@testing-library/react'

import { EasterDates, EasterDatesProps } from './EasterDates'

describe('EasterDates', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const defaultProps: EasterDatesProps = {
    title: 'Easter Dates {year}',
    westernEasterLabel: 'Western Easter',
    orthodoxEasterLabel: 'Orthodox Easter',
    passoverLabel: 'Passover'
  }

  it('renders with default props', () => {
    render(<EasterDates {...defaultProps} />)
    expect(screen.getByText('Easter Dates 2024')).toBeInTheDocument()
    expect(screen.queryByText('March 31, 2024')).not.toBeInTheDocument()
  })

  it('renders with French locale', () => {
    render(<EasterDates {...defaultProps} locale="fr-FR" />)
    fireEvent.click(screen.getByText('Easter Dates 2024'))
    expect(screen.getByText(/dimanche.*mars.*2024/i)).toBeInTheDocument()
  })

  it('calculates Western Easter correctly for known dates', () => {
    render(<EasterDates {...defaultProps} />)
    fireEvent.click(screen.getByText('Easter Dates 2024'))
    expect(screen.getByText('Sunday, March 31, 2024')).toBeInTheDocument()
  })

  it('calculates Orthodox Easter correctly for known dates', () => {
    render(<EasterDates {...defaultProps} />)
    fireEvent.click(screen.getByText('Easter Dates 2024'))
    expect(screen.getByText('Sunday, May 5, 2024')).toBeInTheDocument()
  })
})
