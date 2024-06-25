import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TrendDown1 from '@core/shared/ui/icons/TrendDown1'
import { AnalyticsDataPoint } from '.'

describe('AnalyticsDataPoint', () => {
  it('should render', async () => {
    render(
      <AnalyticsDataPoint Icon={TrendDown1} tooltipTitle="Clicks" value={10} />
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByTestId('TrendDown1Icon')).toBeInTheDocument()

    const element = screen.getByTestId('AnalyticsDataPoint')
    await userEvent.hover(element)

    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
  })

  it('should render without icon', () => {
    render(<AnalyticsDataPoint tooltipTitle="Clicks" value={10} />)

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.queryByTestId('TrendDown1Icon')).not.toBeInTheDocument()
  })
})
