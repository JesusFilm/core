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

    expect(screen.getByLabelText('From')).toBeInTheDocument()
    expect(screen.getByLabelText('To')).toBeInTheDocument()
  })

  it('calls onChange handlers when calendar dates are clicked', async () => {
    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        onStartDateChange={mockStartDateChange}
        onEndDateChange={mockEndDateChange}
      />
    )

    const startDateInput = screen.getByLabelText('From')
    const endDateInput = screen.getByLabelText('To')

    fireEvent.click(startDateInput)
    const startDateCell = screen.getAllByRole('gridcell', { name: '1' })[0]
    fireEvent.click(startDateCell)

    fireEvent.click(endDateInput)
    const endDateCell = screen.getAllByRole('gridcell', { name: '2' })[0]
    fireEvent.click(endDateCell)

    expect(mockStartDateChange).toHaveBeenCalledTimes(1)
    expect(mockEndDateChange).toHaveBeenCalledTimes(1)
    // Check the first argument of the first call is a Date
    expect(mockStartDateChange.mock.calls[0][0]).toBeInstanceOf(Date)
    expect(mockEndDateChange.mock.calls[0][0]).toBeInstanceOf(Date)
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

    expect(screen.getByLabelText('From')).toHaveValue('15-01-2024')
    expect(screen.getByLabelText('To')).toHaveValue('20-02-2024')
  })
})
