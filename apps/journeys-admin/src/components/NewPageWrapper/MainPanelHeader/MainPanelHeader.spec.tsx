import { render } from '@testing-library/react'
import { MainPanelHeader } from '.'

describe('MainPanelHeader', () => {
  it('should show back button with correct link', () => {
    const { getByRole } = render(
      <MainPanelHeader title="Page title" backHref="/" />
    )
    expect(getByRole('link')).toHaveAttribute('href', '/')
  })
})
