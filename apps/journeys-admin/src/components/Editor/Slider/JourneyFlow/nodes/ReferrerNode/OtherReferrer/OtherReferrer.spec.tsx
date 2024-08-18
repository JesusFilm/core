import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { OtherReferrer } from '.'

describe('OtherReferrer', () => {
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

  it('should render other referrer', () => {
    render(<OtherReferrer referrers={referrers} />)

    expect(screen.getByText('other sources')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('should render referrer list', async () => {
    render(<OtherReferrer referrers={referrers} />)

    const node = screen.getByTestId('OtherReferrer')
    const referrer = screen.getByText('Facebook')

    expect(referrer).not.toBeVisible()

    await userEvent.click(within(node).getByRole('button'))

    expect(referrer).toBeVisible()
  })
})
