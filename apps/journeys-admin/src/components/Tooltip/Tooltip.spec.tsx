import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { Tooltip } from '.'

describe('Tooltip', () => {
  it('should render on hover', async () => {
    render(
      <Tooltip title="Hello World">
        <span>Tooltip</span>
      </Tooltip>
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await userEvent.hover(screen.getByText('Tooltip'))

    const tooltip = await screen.findByRole('tooltip')

    expect(tooltip).toBeInTheDocument()
    expect(within(tooltip).getByText('Hello World')).toBeVisible()
  })
})
