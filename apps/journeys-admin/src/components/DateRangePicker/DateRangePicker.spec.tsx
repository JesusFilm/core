import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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

  it('calls onChange handlers when dates are changed', async () => {
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

    await userEvent.click(startDateInput)
    const startDate = screen.getByRole('gridcell', { name: '1' })
    await userEvent.click(startDate)

    await userEvent.click(endDateInput)
    const endDate = screen.getByRole('gridcell', { name: '2' })
    await userEvent.click(endDate)

    expect(mockStartDateChange).toHaveBeenCalled()
    expect(mockEndDateChange).toHaveBeenCalled()
  })
})
