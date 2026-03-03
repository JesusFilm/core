import { fireEvent, render, screen, within } from '@testing-library/react'

import { dateRangePresetLabels } from '../buildPresetDateRange'

import { AnalyticsOverlayDateRangeSelect } from './AnalyticsOverlayDateRangeSelect'

describe('AnalyticsOverlayDateRangeSelect', () => {
  it('renders with the current preset label and aria label', () => {
    render(
      <AnalyticsOverlayDateRangeSelect
        value="today"
        onChange={jest.fn()}
      />
    )

    const selectRoot = screen.getByLabelText('Date range preset')

    expect(selectRoot).toBeInTheDocument()
    expect(
      within(selectRoot).getByText(dateRangePresetLabels.today)
    ).toBeInTheDocument()
  })

  it('calls onChange when a different preset is selected', () => {
    const handleChange = jest.fn()

    render(
      <AnalyticsOverlayDateRangeSelect value="today" onChange={handleChange} />
    )

    const selectRoot = screen.getByLabelText('Date range preset')
    const combobox = within(selectRoot).getByRole('combobox')

    fireEvent.mouseDown(combobox)

    const yesterdayOption = screen.getByRole('option', {
      name: dateRangePresetLabels.yesterday
    })

    fireEvent.click(yesterdayOption)

    expect(handleChange).toHaveBeenCalledWith('yesterday')
  })

  it('renders dividers between preset groups', () => {
    render(
      <AnalyticsOverlayDateRangeSelect
        value="today"
        onChange={jest.fn()}
      />
    )

    const selectRoot = screen.getByLabelText('Date range preset')
    const combobox = within(selectRoot).getByRole('combobox')

    fireEvent.mouseDown(combobox)

    const options = screen.getAllByRole('option')
    const dividerOptions = options.filter(
      (element) => element.tagName.toLowerCase() === 'hr'
    )

    expect(dividerOptions).toHaveLength(4)
  })
})

