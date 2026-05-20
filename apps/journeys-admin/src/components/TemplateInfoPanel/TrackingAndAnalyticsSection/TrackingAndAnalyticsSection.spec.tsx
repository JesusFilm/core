import { render, screen } from '@testing-library/react'

import { TrackingAndAnalyticsSection } from './TrackingAndAnalyticsSection'

describe('TrackingAndAnalyticsSection', () => {
  it('renders the opening and closing paragraphs verbatim', () => {
    render(<TrackingAndAnalyticsSection />)

    expect(
      screen.getByText(
        'Track more than just views and responses. To track specific button clicks, video views, or card visits, you must tag those elements as "trackable."'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'After your shared projects generate activity, you will be able to see the statistics for your selected events in a detailed table.'
      )
    ).toBeInTheDocument()
  })

  it('renders both tracking screenshots at the expected paths', () => {
    render(<TrackingAndAnalyticsSection />)

    expect(
      screen.getByAltText(
        'Button Properties panel with tracking event configuration'
      )
    ).toHaveAttribute(
      'src',
      '/assets/template-info/tracking-button-properties.png'
    )
    expect(
      screen.getByAltText(
        'Analytics statistics detailed table view showing event data'
      )
    ).toHaveAttribute(
      'src',
      '/assets/template-info/tracking-analytics-table.png'
    )
  })

  it('renders the bolded "Tracking" label and an SVG icon in step 2', () => {
    render(<TrackingAndAnalyticsSection />)

    expect(screen.getByText('Tracking')).toBeInTheDocument()
    expect(screen.getByText('Tracking').tagName).toBe('STRONG')

    const section = screen.getByTestId('TrackingAndAnalyticsSection')
    const svg = section.querySelector('svg')
    expect(svg).not.toBeNull()
  })
})
