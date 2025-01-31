import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { ReferrerValue } from '.'

describe('ReferrerValue', () => {
  it('should render', async () => {
    render(
      <ReferrerValue
        tooltipTitle="facebook"
        property="facebook"
        visitors={100}
      />
    )

    const value = screen.getByText('facebook')

    expect(value).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()

    await userEvent.hover(value)

    const tip = await screen.findByRole('tooltip')

    expect(within(tip).getByText('facebook')).toBeVisible()
  })
})
