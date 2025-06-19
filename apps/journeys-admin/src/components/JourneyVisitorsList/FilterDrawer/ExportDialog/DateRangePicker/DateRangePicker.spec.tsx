import { fireEvent, render, screen } from '@testing-library/react'

import { DateRangePicker } from './DateRangePicker'

describe('DateRangePicker', () => {
  const mockStartDateChange = jest.fn()
  const mockEndDateChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the date pickers with labels', () => {
    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        onStartDateChange={mockStartDateChange}
        onEndDateChange={mockEndDateChange}
      />
    )

    expect(
      screen.getAllByRole('group', { name: 'From' })[0]
    ).toBeInTheDocument()
    expect(screen.getAllByRole('group', { name: 'To' })[0]).toBeInTheDocument()
  })

  it('renders calendar icon buttons for opening date pickers', async () => {
    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        onStartDateChange={mockStartDateChange}
        onEndDateChange={mockEndDateChange}
      />
    )

    const calendarButtons = screen.getAllByRole('button', {
      name: 'Choose date'
    })
    expect(calendarButtons).toHaveLength(2)

    // Test that clicking the buttons doesn't throw errors
    fireEvent.click(calendarButtons[0])
    fireEvent.click(calendarButtons[1])
  })

  it('renders the pickers with initial values', () => {
    const initialStartDate = new Date(2024, 0, 15) // Jan 15, 2024
    const initialEndDate = new Date(2024, 1, 20) // Feb 20, 2024

    render(
      <DateRangePicker
        startDate={initialStartDate}
        endDate={initialEndDate}
        onStartDateChange={mockStartDateChange}
        onEndDateChange={mockEndDateChange}
      />
    )

    // Use the hidden input elements that contain the actual values
    const fromInputs = screen.getAllByDisplayValue('15-01-2024')
    const toInputs = screen.getAllByDisplayValue('20-02-2024')

    expect(fromInputs.length).toBeGreaterThan(0)
    expect(toInputs.length).toBeGreaterThan(0)
  })
})
