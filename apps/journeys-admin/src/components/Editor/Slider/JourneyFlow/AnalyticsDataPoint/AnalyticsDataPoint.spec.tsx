import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PointerClick from '@core/shared/ui/icons/PointerClick'

import { AnalyticsDataPoint } from '.'

describe('AnalyticsDataPoint', () => {
  it('should render', async () => {
    render(
      <AnalyticsDataPoint Icon={PointerClick} tooltipLabel="Clicks">
        {10}
      </AnalyticsDataPoint>
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByTestId('PointerClickIcon')).toBeInTheDocument()

    const element = screen.getByTestId('AnalyticsDataPoint')
    await userEvent.hover(element)

    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
  })

  it('should render without icon', () => {
    render(<AnalyticsDataPoint tooltipLabel="Clicks">{10}</AnalyticsDataPoint>)

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.queryByTestId('PointerClickIcon')).not.toBeInTheDocument()
  })
})
