import { render, screen } from '@testing-library/react'

import PointerClick from '@core/shared/ui/icons/PointerClick'

import { AnalyticsDataPoint } from '.'

describe('AnalyticsDataPoint', () => {
  it('should render', () => {
    render(
      <AnalyticsDataPoint Icon={PointerClick} tooltipLabel="Clicks">
        {10}
      </AnalyticsDataPoint>
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByTestId('PointerClickIcon')).toBeInTheDocument()
  })

  it('should render without icon', () => {
    render(<AnalyticsDataPoint tooltipLabel="Clicks">{10}</AnalyticsDataPoint>)

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.queryByTestId('PointerClickIcon')).not.toBeInTheDocument()
  })
})
