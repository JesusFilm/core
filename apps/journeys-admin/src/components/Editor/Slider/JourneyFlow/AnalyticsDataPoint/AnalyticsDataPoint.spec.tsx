import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Cursor4 from '@core/shared/ui/icons/Cursor4'
import { AnalyticsDataPoint } from '.'

describe('AnalyticsDataPoint', () => {
  it('should render', async () => {
    render(
      <AnalyticsDataPoint Icon={Cursor4} tooltipLabel="Clicks">
        {10}
      </AnalyticsDataPoint>
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByTestId('Cursor4Icon')).toBeInTheDocument()

    const element = screen.getByTestId('AnalyticsDataPoint')
    await userEvent.hover(element)

    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
  })

  it('should render without icon', () => {
    render(<AnalyticsDataPoint tooltipLabel="Clicks">{10}</AnalyticsDataPoint>)

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.queryByTestId('Cursor4Icon')).not.toBeInTheDocument()
  })
})
