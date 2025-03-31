import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EasterDates } from './EasterDates'

describe('EasterDates', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2024, 2, 15))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('renders the easter dates component with correct year', () => {
    render(<EasterDates />)

    // Check that the component renders with the correct year
    expect(
      screen.getByText('When is Easter celebrated in 2024?')
    ).toBeInTheDocument()
  })

  it('initially renders in collapsed state', () => {
    render(<EasterDates />)

    // The details should not be visible initially
    expect(
      screen.queryByText('Western Easter (Catholic/Protestant)')
    ).not.toBeVisible()
    expect(screen.queryByText('Orthodox')).not.toBeVisible()
    expect(screen.queryByText('Jewish Passover')).not.toBeVisible()
  })

  it('expands when clicked and shows correct dates', () => {
    render(<EasterDates />)

    // Click to expand
    const accordionHeader = screen.getByText(
      'When is Easter celebrated in 2024?'
    )
    fireEvent.click(accordionHeader)

    // Now the details should be visible
    expect(
      screen.getByText('Western Easter (Catholic/Protestant)')
    ).toBeVisible()
    expect(screen.getByText('Orthodox')).toBeVisible()
    expect(screen.getByText('Jewish Passover')).toBeVisible()

    // Verify the dates for 2024
    expect(screen.getByText('Sunday, March 31, 2024')).toBeInTheDocument() // Western Easter 2024
    expect(screen.getByText('Sunday, May 5, 2024')).toBeInTheDocument() // Orthodox Easter 2024
    expect(screen.getByText('Saturday, March 30, 2024')).toBeInTheDocument() // Passover 2024
  })

  it('collapses when clicked again', async () => {
    render(<EasterDates />)

    // Click to expand
    const accordionHeader = screen.getByText(
      'When is Easter celebrated in 2024?'
    )
    fireEvent.click(accordionHeader)

    // Details should be visible
    expect(
      screen.getByText('Western Easter (Catholic/Protestant)')
    ).toBeVisible()

    // Click again to collapse
    fireEvent.click(accordionHeader)

    // Now the details should not be visible again
    await waitFor(() => {
      expect(
        screen.queryByText('Western Easter (Catholic/Protestant)')
      ).not.toBeVisible()
    })
  })

  it('has the correct data-testid attribute', () => {
    render(<EasterDates />)

    // Verify that the component has the correct data-testid
    expect(screen.getByTestId('EasterDates')).toBeInTheDocument()
  })
})
