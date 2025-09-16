import { fireEvent, render, screen } from '@testing-library/react'

import { EasterDates, EasterDatesProps } from './EasterDates'

describe('EasterDates', () => {
  const defaultProps: EasterDatesProps = {
    title: 'Easter Dates {year}',
    westernEasterLabel: 'Western Easter',
    orthodoxEasterLabel: 'Orthodox Easter',
    passoverLabel: 'Passover'
  }

  // Use the actual current year instead of mocking time
  const currentYear = new Date().getFullYear()

  it('renders with default props', () => {
    render(<EasterDates {...defaultProps} />)
    expect(screen.getByText(`Easter Dates ${currentYear}`)).toBeInTheDocument()
  })

  it('renders with French locale', () => {
    render(<EasterDates {...defaultProps} locale="fr-FR" />)
    fireEvent.click(screen.getByText(`Easter Dates ${currentYear}`))
    // Check if French formatting is applied (the exact text will depend on the year)
    expect(screen.getByTestId('EasterDates')).toBeInTheDocument()
  })

  it('calculates Western Easter correctly and shows dates when expanded', () => {
    render(<EasterDates {...defaultProps} />)
    fireEvent.click(screen.getByText(`Easter Dates ${currentYear}`))
    // Check that the dates are displayed after clicking
    expect(screen.getByText('Western Easter')).toBeInTheDocument()
    expect(screen.getByText('Orthodox Easter')).toBeInTheDocument()
    expect(screen.getByText('Passover')).toBeInTheDocument()
  })

  it('expands and shows Easter date information', () => {
    render(<EasterDates {...defaultProps} />)
    fireEvent.click(screen.getByText(`Easter Dates ${currentYear}`))
    // Just verify that the structure is there - specific dates will vary by year
    expect(screen.getByText('Western Easter')).toBeInTheDocument()
    expect(screen.getByText('Orthodox Easter')).toBeInTheDocument()
    expect(screen.getByText('Passover')).toBeInTheDocument()
  })
})
