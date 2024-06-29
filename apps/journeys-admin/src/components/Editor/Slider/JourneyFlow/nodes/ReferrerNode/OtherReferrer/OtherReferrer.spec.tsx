import { render, screen } from '@testing-library/react'
import { OtherReferrer } from '.'

describe('OtherReferrer', () => {
  it('should render other referrer', () => {
    const referrers = [
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Facebook',
        visitors: 10
      },
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Direct / None',
        visitors: 5
      }
    ]

    render(<OtherReferrer referrers={referrers} />)

    expect(screen.getByText('Other sources')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })
})
